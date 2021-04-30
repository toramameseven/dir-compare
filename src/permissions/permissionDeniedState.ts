import { Entry, PermissionDeniedState } from "../types"

export function getPermissionDeniedState(entry1: Entry, entry2: Entry): PermissionDeniedState {
    if (entry1.isPermissionDenied && entry2.isPermissionDenied) {
        return "error-both"
    } else if (entry1.isPermissionDenied) {
        return "error-left"
    } else if (entry2.isPermissionDenied) {
        return "error-right"
    } else {
        return "access-ok"
    }
}

export function getPrmissionDenieStateWhenLeftMissing(entry2: Entry): PermissionDeniedState {
    let permissionDeniedState: PermissionDeniedState = "access-ok"
    if (entry2.isPermissionDenied) {
        permissionDeniedState = "error-right"
    }
    return permissionDeniedState
}

export function getPrmissionDenieStateWhenRightMissing(entry1): PermissionDeniedState {
    let permissionDeniedState: PermissionDeniedState = "access-ok"
    if (entry1.isPermissionDenied) {
        permissionDeniedState = "error-left"
    }
    return permissionDeniedState
}
