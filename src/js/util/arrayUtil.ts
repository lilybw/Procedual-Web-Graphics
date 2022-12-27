export const to2DArray = (array: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray[] => {
    const newArray = new Array<Uint8ClampedArray>(height);
    for (let i = 0; i < height; i++) {
        newArray[i] = array.slice(i * width, (i + 1) * width);
    }
    return newArray;
}
/**
 * Fills a provided 2D array with the values of a 1D array
 * @param source the array which values should be copied to the target
 * @param width the width of the target
 * @param height the height of the target
 * @returns 
 */
export const fill2DArray = (source: Uint8ClampedArray, target: Uint8ClampedArray[], width: number, height: number): Uint8ClampedArray[] => {
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            target[y][x] = source[y * width + x];
        }
    }
    return target;
}

export const to1DArray = (array: Uint8ClampedArray[]): Uint8ClampedArray => {
    const newArray = new Uint8ClampedArray(array.length * array[0].length);
    for (let i = 0; i < array.length; i++) {
        newArray.set(array[i], i * array[0].length);
    }
    return newArray;
}

export const fill1DArray = (source: Uint8ClampedArray[], target: Uint8ClampedArray): Uint8ClampedArray => {
    for (let y = 0; y < source.length; y++) {
        for (let x = 0; x < source[y].length; x++) {
            // Get the index of the current element in the target array
            const i = y * source[y].length + x;

            // Assign the value from the source array to the target array
            target[i] = source[y][x];
        }
    }
    return target;
}