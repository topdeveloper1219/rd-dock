export function compareKeys(a, b, keys) {
    if (a === b) {
        return true;
    }
    if (a && b && typeof a === 'object' && typeof b === 'object') {
        for (let key of keys) {
            if (a[key] !== b[key]) {
                return false;
            }
        }
        return true;
    }
    return false;
}
const isArray = Array.isArray;
export function compareArray(a, b) {
    if (a === b) {
        return true;
    }
    if (isArray(a) && isArray(b)) {
        let len = a.length;
        if (len !== b.length) {
            return false;
        }
        for (let i = 0; i < len; ++i) {
            if (a[i] !== b[i]) {
                return false;
            }
        }
        return true;
    }
    return false;
}
