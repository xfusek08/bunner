export const OptionTypes = ['string', 'number', 'boolean'] as const;

export type OptionTypes = typeof OptionTypes;
export type OptionType = OptionTypes[number];
