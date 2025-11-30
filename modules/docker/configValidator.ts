import { log } from '../../framework';

interface DockerComposePort {
    target: number;
}

interface DockerComposeService {
    ports?: DockerComposePort[];
}

export interface DockerComposeConfig {
    name: string;
    services: Record<string, DockerComposeService>;
}

export class DockerComposeConfigError extends Error {
    constructor(
        message: string,
        public readonly details?: unknown,
    ) {
        super(message);
        this.name = 'DockerComposeConfigError';
    }
}

function isString(value: unknown): value is string {
    return typeof value === 'string';
}

function isNumber(value: unknown): value is number {
    return typeof value === 'number';
}

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

type Validator<T> = (value: unknown, errors: string[], path: string) => value is T;

function optional<T>(
    validator: Validator<T>,
): (value: unknown, errors: string[], path: string) => value is T | undefined {
    return (value: unknown, errors: string[], path: string): value is T | undefined => {
        if (value === undefined) {
            return true;
        }
        return validator(value, errors, path);
    };
}

function array<T>(
    itemValidator: Validator<T>,
): (value: unknown, errors: string[], path: string) => value is T[] {
    return (value: unknown, errors: string[], path: string): value is T[] => {
        if (!Array.isArray(value)) {
            errors.push(`${path}: Expected an array, got ${typeof value}`);
            return false;
        }
        let valid = true;
        value.forEach((item, index) => {
            if (!itemValidator(item, errors, `${path}[${index}]`)) {
                valid = false;
            }
        });
        return valid;
    };
}

function isDockerComposePort(
    value: unknown,
    errors: string[],
    path: string,
): value is DockerComposePort {
    if (!isObject(value)) {
        errors.push(`${path}: Expected an object, got ${typeof value}`);
        return false;
    }
    if (!isNumber(value.target)) {
        errors.push(`${path}.target: Expected a number, got ${typeof value.target}`);
        return false;
    }
    return true;
}

const isOptionalDockerComposePorts = optional(array(isDockerComposePort));

function isDockerComposeService(
    value: unknown,
    errors: string[],
    path: string,
): value is DockerComposeService {
    if (!isObject(value)) {
        errors.push(`${path}: Expected an object, got ${typeof value}`);
        return false;
    }
    if (!isOptionalDockerComposePorts(value.ports, errors, `${path}.ports`)) {
        return false;
    }
    return true;
}

function isDockerComposeConfig(value: unknown, errors: string[]): value is DockerComposeConfig {
    if (!isObject(value)) {
        errors.push(`Root: Expected an object, got ${typeof value}`);
        return false;
    }
    if (!isString(value.name)) {
        errors.push(`name: Expected a string, got ${typeof value.name}`);
    }
    if (!isObject(value.services)) {
        errors.push(`services: Expected an object, got ${typeof value.services}`);
        return false;
    }
    let valid = errors.length === 0;
    Object.entries(value.services).forEach(([serviceName, service]) => {
        if (!isDockerComposeService(service, errors, `services.${serviceName}`)) {
            valid = false;
        }
    });
    return valid;
}

/**
 * @throws {DockerComposeConfigError} When the JSON is invalid or does not conform to the expected structure.
 */
export function parseDockerComposeConfigJson(json: string): DockerComposeConfig {
    let parsed: unknown;

    try {
        log.debug('Parsing Docker Compose configuration JSON...');
        parsed = JSON.parse(json);
    } catch (error) {
        throw new DockerComposeConfigError('Invalid JSON format', error);
    }

    const errors: string[] = [];
    if (!isDockerComposeConfig(parsed, errors)) {
        console.error('Invalid Docker Compose configuration structure:');
        errors.forEach((e) => console.error(`  - ${e}`));
        throw new DockerComposeConfigError(
            'Invalid Docker Compose configuration structure:\n' +
                errors.map((e) => `  - ${e}`).join('\n'),
            { errors },
        );
    }

    return parsed;
}
