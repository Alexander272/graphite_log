export const PermRules = Object.freeze({
	Graphite: {
		Read: 'graphite:read' as const,
		Write: 'graphite:write' as const,
	},
	GraphitePurpose: {
		Read: 'graphite_purpose:read' as const,
		Write: 'graphite_purpose:write' as const,
	},
	GraphitePlace: {
		Read: 'graphite_place:read' as const,
		Write: 'graphite_place:write' as const,
	},
	GraphiteNotes: {
		Read: 'graphite_notes:read' as const,
		Write: 'graphite_notes:write' as const,
	},
	Extending: {
		Read: 'extending:read' as const,
		Write: 'extending:write' as const,
	},
	Issuance: {
		Read: 'issuance:read' as const,
		Write: 'issuance:write' as const,
	},
	Import: {
		Write: 'import:write' as const,
	},
	Realms: {
		Read: 'realms:read' as const,
		Write: 'realms:write' as const,
	},
})
