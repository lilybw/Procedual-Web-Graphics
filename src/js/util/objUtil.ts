/**
 * Deep copy of all primitive types, shallow copy of all non-primitive types
 * @param config 
 * @returns 
 */
export const copy = <T>(config: T): T => {
    return { ...config };
}
/**
 * Fills the fields of objectB with the values of objectA if objectB has a key by the same name
 * @param objectA i.e. user collected data
 * @param objectB i.e. an expected data template
 * @returns a new object of the same type as objectB
 */
export const fillKeys = <T>(objectA: Object, objectB: T): T => {
    //Thank you https://stackoverflow.com/questions/55103138/fill-fields-in-object-from-other-object
    return Object.assign(
        {},
        objectB,
        //@ts-ignore
        ...Object.keys(objectB).map(k => k in objectA && { [k]: objectA[k] })
    );
}