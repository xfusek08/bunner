import GetFirstRequiredKey from "../type-utils/GetFirstRequiredKey";
import { OptionDefinition, SpecificOptionDefinition } from "./OptionDefinition";
import OptionValue from "./OptionValue";



export type ExtractOptionType<D extends OptionDefinition> = D extends SpecificOptionDefinition<infer T> ? T : never;

export type OptionWithDefaultValue<D extends OptionDefinition> = D extends { defaultValue: OptionValue<ExtractOptionType<D>> } ? D : never;


export type ExtractParsedOptionValueType<D extends OptionDefinition, V = OptionValue<ExtractOptionType<D>>> =
    OptionWithDefaultValue<D> extends never
        ? D['required'] extends true
            ? V
            : V|undefined
        : V;

type EvaluatedOption<
    D extends OptionDefinition,
    Keys = D[GetFirstRequiredKey<D, ["long", "short"]>],
> = Keys extends string ? {
    [K in Keys]: ExtractParsedOptionValueType<D>
} : never;

type EvaluatedOptions<T extends readonly OptionDefinition[]> =
    T extends readonly [infer First, ...infer Rest]
        ? First extends OptionDefinition
            ? EvaluatedOption<First> & EvaluatedOptions<
                Rest extends readonly OptionDefinition[]
                    ? Rest
                    : []
                >
            : {}
        : {}

export default EvaluatedOptions;

export function hasDefaultValue<D extends OptionDefinition>(option: D): option is OptionWithDefaultValue<D> {
    return 'defaultValue' in option && option.defaultValue !== undefined;
}
