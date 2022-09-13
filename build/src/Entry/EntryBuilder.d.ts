import { Entry } from '..';
import { ExtOptions } from '../ExtOptions';
export declare const EntryBuilder: {
    /**
     * Returns the sorted list of entries in a directory.
     */
    buildDirEntries(rootEntry: Entry, dirEntries: string[], relativePath: string, options: ExtOptions): Entry[];
    buildEntry(absolutePath: string, path: string, name: string, options: ExtOptions): Entry;
};
//# sourceMappingURL=EntryBuilder.d.ts.map