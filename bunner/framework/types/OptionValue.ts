import { OptionType } from "./OptionType";

type OptionValue<T extends OptionType> =
    T extends 'string' ? string :
    T extends 'number' ? number :
    T extends 'boolean' ? boolean :
    never;

export default OptionValue;
