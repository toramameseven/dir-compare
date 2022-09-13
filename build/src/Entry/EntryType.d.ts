import { DifferenceType, Entry } from "..";
export declare type OptionalEntry = Entry | undefined;
export declare const EntryType: {
    /**
     * One of 'missing','file','directory','broken-link'
     */
    getType(entry: OptionalEntry): DifferenceType;
};
//# sourceMappingURL=EntryType.d.ts.map