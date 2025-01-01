
export default interface CommandOptionDefinition {
    short: string;
    long: string;
    description: string;
}

export type SpecificOptionCommandDefinition<C extends CommandOptionDefinition> = string extends C['short'] ? never : C;

export type SpecificOptionsCommandDefinitionArray<C extends readonly CommandOptionDefinition[]> = {
    [K in keyof C]: SpecificOptionCommandDefinition<C[K]>;
};
