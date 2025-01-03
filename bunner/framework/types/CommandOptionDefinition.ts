import CommandOptionType from "./CommandOptionType";

export default interface CommandOptionDefinition {
    readonly short?: string;
    readonly long?: string;
    readonly description: string;
    readonly type: CommandOptionType;
    readonly required: boolean;
}

export type SpecificOptionCommandDefinition<C> = C extends CommandOptionDefinition ? {
    [K in keyof C]:
        C[K] extends string
            ? string extends C[K]
                ? never
                : C[K]
            : C[K]
} : never;

export type SpecificOptionsCommandDefinitionArray<C extends readonly unknown[]> = {
    [K in keyof C]: SpecificOptionCommandDefinition<C[K]>;
};
