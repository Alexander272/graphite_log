export const API = {
	auth: {
		signIn: `auth/sign-in` as const,
		refresh: `auth/refresh` as const,
		signOut: `auth/sign-out` as const,
	},
	table: {
		base: '/graphite' as const,
		unique: '/graphite/unique' as const,
		purpose: (id: string) => `/graphite/${id}/purpose` as const,
		place: (id: string) => `/graphite/${id}/place` as const,
		notes: (id: string) => `/graphite/${id}/notes` as const,
	},
	extending: '/extending' as const,
	issuance: '/issuance' as const,
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
	accesses: '/accesses' as const,
	import: '/import' as const,
}
