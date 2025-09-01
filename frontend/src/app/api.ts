export const API = {
	auth: {
		signIn: `auth/sign-in` as const,
		refresh: `auth/refresh` as const,
		signOut: `auth/sign-out` as const,
	},
	filters: '/filters' as const,
	sorting: '/sorting' as const,
	realms: {
		base: '/realms' as const,
		user: '/realms/user' as const,
		choose: '/realms/choose' as const,
	},
	users: {
		base: '/users' as const,
		sync: '/users/sync' as const,
		access: '/users/access' as const,
		realm: '/users/realm' as const,
	},
	roles: '/roles' as const,
}
