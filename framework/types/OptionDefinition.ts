import JoinUnions from '../type-utils/JoinUnions';
import RequireAtLeastOne from '../type-utils/RequireAtLeastOne';
import { OptionType, OptionTypes } from './OptionType';
import OptionValue from './OptionValue';

type OptionTypesWithoutBool = Exclude<OptionType, 'boolean'>;

type BaseOptionDefinition = RequireAtLeastOne<{
    readonly short: string;
    readonly long: string;
}> & {
    readonly description: string;
};

type RequiredOption<T extends OptionTypesWithoutBool> = {
    readonly type: T;
    readonly required: true;
};

type OptionalOption<T extends OptionTypesWithoutBool> = {
    readonly type: T;
    readonly required: false;
    readonly defaultValue?: OptionValue<T>;
};

type BooleanOption = {
    readonly type: 'boolean';
};

type OptionValueTypeToOptionDefinitionVariant<T extends OptionType> =
    T extends OptionTypesWithoutBool
        ? (BaseOptionDefinition & RequiredOption<T>) | (BaseOptionDefinition & OptionalOption<T>)
        : BaseOptionDefinition & BooleanOption;

type OptionDefinitionFromArray<T extends readonly OptionType[]> = T extends readonly [
    infer F,
    ...infer R,
]
    ? F extends OptionType
        ? R extends OptionType[]
            ? JoinUnions<OptionValueTypeToOptionDefinitionVariant<F>, OptionDefinitionFromArray<R>>
            : OptionValueTypeToOptionDefinitionVariant<F>
        : T
    : T;

export type SpecificOptionDefinition<T extends OptionType> = OptionDefinitionFromArray<[T]>;

export type OptionDefinition = OptionDefinitionFromArray<OptionTypes>;

export type OptionDefinitions = readonly OptionDefinition[];

export function isOptionOfType<T extends OptionType>(
    definition: OptionDefinition,
    type: T,
): definition is SpecificOptionDefinition<T> {
    return definition.type === type;
}

export function optionBygName(
    definitions: OptionDefinitions,
    name: string,
): OptionDefinition | undefined {
    return definitions.find((definition) => {
        if (definition.short === name || definition.long === name) {
            return true;
        }
        return false;
    });
}

// Type tests
// String required option
// eslint-disable-next-line unused-imports/no-unused-vars
type StringRequiredOption = SpecificOptionDefinition<'string'>; // BaseOptionDefinition & { type: 'string', required: true | false }

// Path required option
// eslint-disable-next-line unused-imports/no-unused-vars
type PathRequiredOption = SpecificOptionDefinition<'path'>; // BaseOptionDefinition & { type: 'path', required: true | false }

// Number option explicitly required
// eslint-disable-next-line unused-imports/no-unused-vars
type RequiredNumberOption = BaseOptionDefinition & RequiredOption<'number'>; // { short/long, description, type: 'number', required: true }

// Path option explicitly required
// eslint-disable-next-line unused-imports/no-unused-vars
type RequiredPathOption = BaseOptionDefinition & RequiredOption<'path'>; // { short/long, description, type: 'path', required: true }

// Boolean option (boolean options don't have required field)
// eslint-disable-next-line unused-imports/no-unused-vars
type BooleanOptionTest = SpecificOptionDefinition<'boolean'>; // BaseOptionDefinition & { type: 'boolean' }

// Optional string with default
// eslint-disable-next-line unused-imports/no-unused-vars
type OptionalStringWithDefault = BaseOptionDefinition & OptionalOption<'string'>; // { short/long, description, type: 'string', required: false, defaultValue?: string }

// Optional path with default
// eslint-disable-next-line unused-imports/no-unused-vars
type OptionalPathWithDefault = BaseOptionDefinition & OptionalOption<'path'>; // { short/long, description, type: 'path', required: false, defaultValue?: string }

// Full option definition includes all types
// eslint-disable-next-line unused-imports/no-unused-vars
type FullOptionDefinitionTest = OptionDefinition; // Union of all possible option types
