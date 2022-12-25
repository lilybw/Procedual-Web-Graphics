export const copy = <T>(config: T): T => {
    return { ...config };
}
export const fillKeys = (objectA: Object, objectB: Object) => {
    //Thank you https://stackoverflow.com/questions/55103138/fill-fields-in-object-from-other-object
    return Object.assign(
        {},
        objectB,
        //@ts-ignore
        ...Object.keys(objectB).map(k => k in objectA && { [k]: objectA[k] })
    );
}