import { Reason } from "../..";
import { FileEqualityAsync } from "./FileEqualityAsync";

export type FileEqualityPromise = {
    same?: boolean;  // TODO refactor conditional typing; also refactor in compareAsync.ts
    reason?: Reason;
    fileEqualityAsyncPromise?: Promise<FileEqualityAsync>;
};
