import OptionValue from "./OptionValue";
import { OptionType, OptionTypes } from "./OptionValueType";

type BaseOptionDefinition = RequireAtLeastOne<{
    readonly short: string;
    readonly long: string;
}> & {
    readonly description: string;
};

type RequiredOption<T extends OptionType> = {
    readonly type: T;
    readonly required: true;
};

type OptionalOption<T extends OptionType> = {
    readonly type: T;
    readonly required: false;
    readonly defaultValue?: OptionValue<T>;
};

type JoinUnions<A,B> = B extends any
    ? [] extends B
        ? A
        : A | B
    : A;

type OptionValueTypeToOptionDefinitionVariant<T extends OptionType> =
    (BaseOptionDefinition & RequiredOption<T>) | (BaseOptionDefinition & OptionalOption<T>)

type OptionDefinitionFromArray<T extends readonly OptionType[]> =
    T extends readonly [infer F, ...infer R]
        ? F extends OptionType
            ? R extends OptionType[]
                ? JoinUnions<
                    OptionValueTypeToOptionDefinitionVariant<F>,
                    OptionDefinitionFromArray<R>
                >
                : OptionValueTypeToOptionDefinitionVariant<F>
            : T
        : T;

export type SpecificOptionDefinition<T extends OptionType> = OptionDefinitionFromArray<[T]>;

export type OptionDefinition = OptionDefinitionFromArray<OptionTypes>;

export function isOptionOfType<T extends OptionType>(definition: OptionDefinition, type: T): definition is SpecificOptionDefinition<T> {
    return definition.type === type;
}
