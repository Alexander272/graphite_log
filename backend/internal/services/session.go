package services

import (
	"context"
	"fmt"
	"os"
	"strings"

	"github.com/Alexander272/graphite_log/backend/internal/models"
	"github.com/Alexander272/graphite_log/backend/pkg/auth"
)

type SessionService struct {
	keycloak *auth.KeycloakClient
	user     User
}

func NewSessionService(keycloak *auth.KeycloakClient, user User) *SessionService {
	return &SessionService{
		keycloak: keycloak,
		user:     user,
	}
}

type Session interface {
	SignIn(ctx context.Context, u *models.SignInDTO) (*models.User, error)
	SignOut(ctx context.Context, refreshToken string) error
	Refresh(ctx context.Context, req *models.RefreshDTO) (*models.User, error)
	DecodeAccessToken(ctx context.Context, token string) (*models.User, error)
}

func (s *SessionService) SignIn(ctx context.Context, u *models.SignInDTO) (*models.User, error) {
	res, err := s.keycloak.Client.Login(ctx, s.keycloak.ClientId, s.keycloak.ClientSecret, s.keycloak.Realm, u.Username, u.Password)
	if err != nil {
		return nil, fmt.Errorf("failed to login to keycloak. error: %w", err)
	}

	decodedUser, err := s.DecodeAccessToken(ctx, res.AccessToken)
	if err != nil {
		return nil, err
	}

	user, err := s.user.GetInfo(ctx, &models.GetUserInfoDTO{UserId: decodedUser.Id, Role: decodedUser.Role})
	if err != nil {
		return nil, err
	}

	user.Name = decodedUser.Name
	user.AccessToken = res.AccessToken
	user.RefreshToken = res.RefreshToken

	return user, nil
}

func (s *SessionService) SignOut(ctx context.Context, refreshToken string) error {
	err := s.keycloak.Client.Logout(ctx, s.keycloak.ClientId, s.keycloak.ClientSecret, s.keycloak.Realm, refreshToken)
	if err != nil {
		return fmt.Errorf("failed to logout to keycloak. error: %w", err)
	}
	return nil
}

func (s *SessionService) Refresh(ctx context.Context, req *models.RefreshDTO) (*models.User, error) {
	res, err := s.keycloak.Client.RefreshToken(ctx, req.Token, s.keycloak.ClientId, s.keycloak.ClientSecret, s.keycloak.Realm)
	if err != nil {
		return nil, fmt.Errorf("failed to refresh token in keycloak. error: %w", err)
	}
	// s.keycloak.Client.LoginClientTokenExchange(ctx, s.keycloak.ClientId, s.keycloak.ClientSecret, s.keycloak.Realm, res.RefreshToken, "")

	decodedUser, err := s.DecodeAccessToken(ctx, res.AccessToken)
	if err != nil {
		return nil, err
	}

	user, err := s.user.GetInfo(ctx, &models.GetUserInfoDTO{UserId: decodedUser.Id, Role: decodedUser.Role})
	if err != nil {
		return nil, err
	}

	user.Name = decodedUser.Name
	user.AccessToken = res.AccessToken
	user.RefreshToken = res.RefreshToken

	return user, nil
}

func (s *SessionService) DecodeAccessToken(ctx context.Context, token string) (*models.User, error) {
	//TODO расшифровку токена тоже лучше делать здесь, а в keycloak
	_, claims, err := s.keycloak.Client.DecodeAccessToken(ctx, token, s.keycloak.Realm)
	if err != nil {
		return nil, fmt.Errorf("failed to decode access token. error: %w", err)
	}

	//TODO можно хранить текущие роли пользователя в redis используя sid в качестве ключа, а еще используя время жизни токена
	// либо же хранить роли в cookie

	serviceName := os.Getenv("SERVICE_ID")

	user := &models.User{}
	var role, username, userId string
	c := *claims
	access, ok := c["realm_access"]
	if ok {
		a := access.(map[string]interface{})["roles"]
		roles := a.([]interface{})
		for _, r := range roles {
			//TODO может получать прификс из конфига
			if strings.Contains(r.(string), serviceName) {
				role = strings.Replace(r.(string), serviceName+"_", "", 1)
				break
			}
		}
	}

	u, ok := c["preferred_username"]
	if ok {
		username = u.(string)
	}

	uId, ok := c["sub"]
	if ok {
		userId = uId.(string)
	}

	user.Id = userId
	user.Role = role
	user.Name = username

	return user, nil
}
