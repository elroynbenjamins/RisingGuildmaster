export interface Party { id: string; heroIds: string[] }
export interface PartyValidationResult { valid: boolean; errors: string[] }
export const MIN_PARTY_SIZE = 1;
export const MAX_PARTY_SIZE = 4;
