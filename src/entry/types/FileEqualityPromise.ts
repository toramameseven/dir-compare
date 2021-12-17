import { Reason } from "../..";
import { SamePromise } from "./SamePromise";

// TODO deprecated
export type FileEqualityPromise = {
    same?: boolean;
    reason?: Reason;
    samePromise?: Promise<SamePromise>;
};
