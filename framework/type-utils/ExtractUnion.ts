type ExtractUnion<T extends readonly unknown[], K extends keyof T[number]> = T[number][K];

export default ExtractUnion;
