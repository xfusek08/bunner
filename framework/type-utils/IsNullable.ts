type IsNullable<T> = T extends null | undefined ? true : false;

export default IsNullable;
