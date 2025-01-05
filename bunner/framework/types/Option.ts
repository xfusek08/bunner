import { OptionDefinition, SpecificOptionDefinition} from "./OptionDefinition";
import OptionValue from "./OptionValue";
import { OptionType } from "./OptionValueType";

export default class Option<T extends OptionType = OptionType> {
    public static readonly OPTION_IDENTIFIER_PROPERTY_NAME_PRIORITY = ['long', 'short'] as const;
    
    private constructor(
        public readonly long: string|undefined,
        public readonly short: string|undefined,
        public readonly description: string,
        public readonly type: T,
        public readonly required: boolean,
        public readonly defaultValue: OptionValue<T>|undefined,
        public readonly _value: OptionValue<T>|undefined,
    ) {}
    
    public static create<T extends OptionType = OptionType>(definition: OptionDefinition, value?: OptionValue<T>): Option {
        return new Option(
            definition.long,
            definition.short,
            definition.description,
            definition.type,
            'required' in definition
                ? definition.required
                : false,
            'defaultValue' in definition
                ? definition.defaultValue
                : undefined,
            value
        );
    }
    
    public get prettyDashedShortLongName(): string {
        return [
            this.shortDashedName,
            this.longDashedName,
        ].filter(Boolean).join("   ");
    }
    
    public get shortDashedName(): string {
        return this.short ? `-${this.short}` : "";
    }
    
    public get longDashedName(): string {
        return this.long ? `--${this.long}` : "";
    }
    
    public get dashedIdentifier(): string {
        return this.longDashedName === "" ? this.shortDashedName : this.longDashedName;
    }
    
    public get identifier(): string {
        for (const key of Option.OPTION_IDENTIFIER_PROPERTY_NAME_PRIORITY) {
            if (this[key]) {
                return this[key];
            }
        }
        
        // Program should never reach this point, because the constructor enforces type that enforces the presence of at least one of the two properties
        throw new Error('Unknown Error: Option does not have neither long nor short name - This should never happen');
    }
    
    public get value(): OptionValue<T>|undefined {
        if (this.isType('boolean')) {
            return this._value ?? false as OptionValue<T>;
        }
        return this._value ?? this.defaultValue;
    }
    
    
    public withValue(value: OptionValue<T>): Option<T> {
        return new Option(
            this.long,
            this.short,
            this.description,
            this.type,
            this.required,
            this.defaultValue,
            value
        );
    }
    
    public isType<TT extends OptionType>(type: TT): this is Option<TT> {
        return this.type === type as OptionType;
    }
    
    public parseValue(value: string): Error|OptionValue<T> {
        if (this.isType('boolean')) {
            return new Error(`Option ${this.prettyDashedShortLongName} does not take a value`);
        }
        
        if (this.isType('number')) {
            const parsed = Number(value);
            if (Number.isNaN(parsed)) {
                return new Error(`Option ${this.prettyDashedShortLongName} must be a number`);
            }
            return parsed as OptionValue<T>;
        }
        
        return value as OptionValue<T>;
    }
    
    public get isValueSet(): boolean {
        return this._value !== undefined;
    }
}
