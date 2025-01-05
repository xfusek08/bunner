import OptionValueType from "./OptionValueType";

type OptionValue<T extends OptionValueType> =
    T extends 'string' ? string :
    T extends 'number' ? number :
    T extends 'boolean' ? boolean :
    never;

export default OptionValue;
