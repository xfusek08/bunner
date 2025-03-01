import isNotNil from './isNotNil';

// Result classes
export class PipeSuccess<T> {
    public readonly success = true;

    constructor(public readonly value: T) {}
}

export class PipeFailure<T> {
    public readonly success = false;

    constructor(
        public readonly lastNonNilValue: T,
        public readonly completedTransformations: number,
        public readonly skippedTransformations: number,
    ) {}
}

// No functions case (identity)
export default function nonNilPipe<T>(value: T | (() => T)): PipeSuccess<T>;

// Single function
export default function nonNilPipe<T, A>(
    value: T | (() => T),
    f1: (x: NonNullable<T>) => A,
): PipeSuccess<A> | PipeFailure<T>;

// Two functions
export default function nonNilPipe<T, A, B>(
    value: T | (() => T),
    f1: (x: NonNullable<T>) => A,
    f2: (x: NonNullable<A>) => B,
): PipeSuccess<B> | PipeFailure<T | A>;

// Three functions
export default function nonNilPipe<T, A, B, C>(
    value: T | (() => T),
    f1: (x: NonNullable<T>) => A,
    f2: (x: NonNullable<A>) => B,
    f3: (x: NonNullable<B>) => C,
): PipeSuccess<C> | PipeFailure<T | A | B>;

// Four functions
export default function nonNilPipe<T, A, B, C, D>(
    value: T | (() => T),
    f1: (x: NonNullable<T>) => A,
    f2: (x: NonNullable<A>) => B,
    f3: (x: NonNullable<B>) => C,
    f4: (x: NonNullable<C>) => D,
): PipeSuccess<D> | PipeFailure<T | A | B | C>;

// Implementation
export default function nonNilPipe(
    value: unknown | (() => unknown),
    ...fns: ((value: unknown) => unknown)[]
): PipeSuccess<unknown> | PipeFailure<unknown> {
    // Resolve the initial value if it's a function
    let currentValue = typeof value === 'function' ? value() : value;

    let completedTransformations = 0;
    let lastNonNilValue = currentValue;

    for (let i = 0; i < fns.length; i++) {
        if (!isNotNil(currentValue)) {
            // Early termination
            return new PipeFailure(
                lastNonNilValue,
                completedTransformations,
                fns.length - completedTransformations,
            );
        }

        // Apply transformation
        lastNonNilValue = currentValue;
        currentValue = fns[i](currentValue);
        completedTransformations++;
    }

    // If we got here, all transformations were successful
    // For the case of no functions, we just return success with the initial value
    return new PipeSuccess(currentValue);
}
