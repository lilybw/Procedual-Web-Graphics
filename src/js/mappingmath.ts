/**
 * The probability distribution function for a normal distribution. 
 * As a goes towards infinity, the result approaches rangeEnd. Same goes for when a goes towards negative infinity. 
 * @param a the value to map to the range
 * @param rangeStart exclusive
 * @param rangeEnd exclusive
 * @returns the value mapped to the range
 */
export const mapToRange = (a: number, rangeStart: number, rangeEnd: number): number => {
    return (1/(1 + Math.E ** -a))*(rangeEnd-rangeStart) + rangeStart;
}
//GitHub Copilot suggested this function. Its probably wrong. Actually yeah its just wrong.
export const snapToIncrement = (a: number, increment: number): number => {
    return Math.round(a/increment)*increment;
}