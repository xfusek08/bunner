import ExtractUnion from "../type-utils/ExtractUnion";
import GetFirstRequiredKey from "../type-utils/GetFirstRequiredKey";
import CommandOptionDefinition from "./CommandOptionDefinition";

type EvaluatedOptions<T extends readonly CommandOptionDefinition[]> = Record<
    ExtractUnion<T, GetFirstRequiredKey<T[number], ["short", "long"]>>,
    string
>;

export default EvaluatedOptions;
