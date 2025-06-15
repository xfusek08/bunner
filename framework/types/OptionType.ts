export const OptionTypes = ['string', 'number', 'boolean', 'path'] as const;

export type OptionTypes = typeof OptionTypes;
export type OptionType = OptionTypes[number];
