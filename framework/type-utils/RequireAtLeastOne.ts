/**
 * see: https://learn.microsoft.com/en-us/javascript/api/@azure/keyvault-certificates/requireatleastone?view=azure-node-latest
 */

type RequireAtLeastOne<T> = {
    [K in keyof T]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<keyof T, K>>>;
}[keyof T];

export default RequireAtLeastOne;
