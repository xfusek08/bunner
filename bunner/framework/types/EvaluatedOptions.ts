import GetFirstRequiredKey from "../type-utils/GetFirstRequiredKey";
import CommandOptionDefinition from "./CommandOptionDefinition";

type EvaluateType<T extends CommandOptionDefinition> = (
    T['type'] extends 'string' ? string
        : T['type'] extends 'number' ? number
        : T['type'] extends 'boolean' ? boolean
        : never
);

type EvaluatePossibleOptionalType<T extends CommandOptionDefinition> =
    T['required'] extends false
        ? null|EvaluateType<T>
        : EvaluateType<T>;

type EvaluatedOption<
    T extends CommandOptionDefinition,
    Keys = T[GetFirstRequiredKey<T, ["long", "short"]>]
> = Keys extends string ? {
    [K in Keys]: EvaluatePossibleOptionalType<T>;
} : never;

type EvaluatedOptions<T extends readonly CommandOptionDefinition[]> =
    T extends readonly [infer First, ...infer Rest]
        ? First extends CommandOptionDefinition
            ? EvaluatedOption<First> & EvaluatedOptions<Rest extends readonly CommandOptionDefinition[] ? Rest : []>
            : {}
        : {}

export default EvaluatedOptions;


const a = {
    short: 'a',
    // long: 'apple',
    description: 'apple',
    type: 'string',
    required: true,
} as const;

type A = typeof a;

type AA = EvaluatedOption<A>

type BB = GetFirstRequiredKey<A, ["long", "short"]>
