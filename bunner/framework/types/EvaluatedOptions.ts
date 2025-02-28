import GetFirstRequiredKey from '../type-utils/GetFirstRequiredKey';
import {
    OptionDefinition,
    OptionDefinitions,
    SpecificOptionDefinition,
} from './OptionDefinition';
import OptionValue from './OptionValue';

type ExtractOptionType<D extends OptionDefinition> =
    D extends SpecificOptionDefinition<infer T> ? T : never;

type IsBooleanOption<D extends OptionDefinition> = D extends { type: 'boolean' }
    ? true
    : false;

type HasDefaultValue<D extends OptionDefinition> = D extends {
    defaultValue: OptionValue<ExtractOptionType<D>>;
}
    ? true
    : false;

type IsRequired<D extends OptionDefinition> = D extends { required: true }
    ? true
    : false;

type WithDefaultValue<D extends OptionDefinition> =
    HasDefaultValue<D> extends true ? D : never;

export type ExtractParsedOptionValueType<
    D extends OptionDefinition,
    V = OptionValue<ExtractOptionType<D>>,
> =
    IsBooleanOption<D> extends true
        ? boolean
        : HasDefaultValue<D> extends true
          ? V
          : IsRequired<D> extends true
            ? V
            : V | undefined;

type EvaluatedOption<
    D extends OptionDefinition,
    Keys = D[GetFirstRequiredKey<D, ['long', 'short']>],
> = Keys extends string
    ? {
          [K in Keys]: ExtractParsedOptionValueType<D>;
      }
    : never;

type EvaluatedOptions<T extends OptionDefinitions> = T extends readonly [
    infer First,
    ...infer Rest,
]
    ? First extends OptionDefinition
        ? EvaluatedOption<First> &
              EvaluatedOptions<Rest extends OptionDefinitions ? Rest : []>
        : object
    : object;

export default EvaluatedOptions;

export function hasDefaultValue<D extends OptionDefinition>(
    option: D,
): option is WithDefaultValue<D> {
    return 'defaultValue' in option && option.defaultValue !== undefined;
}
