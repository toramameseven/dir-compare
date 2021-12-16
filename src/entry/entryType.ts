import { DifferenceType, Entry } from ".."

export = {
	/**
	 * One of 'missing','file','directory','broken-link'
	 */
	getType (entry: Entry): DifferenceType {
		if (!entry) {
			return 'missing'
		}
		if (entry.isBrokenLink) {
			return 'broken-link'
		}
		if (entry.isDirectory) {
			return 'directory'
		}
		return 'file'
	}
}