type JoinUnions<A, B> = B extends unknown ? ([] extends B ? A : A | B) : A;

export default JoinUnions;
