import { Reason } from "../..";
import { FileEqualityAsync2 } from "./FileEqualityAsync2";

export type FileEqualityAsync = {
    same?: boolean;  // TODO refactor conditional typing; also refactor in compareAsync.ts
    reason?: Reason;
    fileEqualityAsyncPromise?: Promise<FileEqualityAsync2>;
};
