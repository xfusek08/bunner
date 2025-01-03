
type ExtractUnion<T extends readonly any[], K extends keyof T[number]> = T[number][K];

export default ExtractUnion;
