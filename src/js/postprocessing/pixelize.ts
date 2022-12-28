import {to2DArray,fill2DArray, fill1DArray} from '../util/arrayUtil';

export default class Pixelizor {
    private dataBuffer: Array<Uint8ClampedArray> = new Array<Uint8ClampedArray>(0);
    private width: number;
    private height: number;

    constructor(width: number, height: number)
    {
        this.width = width;
        this.height = height;
        this.dataBuffer = new Array<Uint8ClampedArray>(height);
        this.dataBuffer.fill(new Uint8ClampedArray(width));
    }

    public pixelize(imageData: ImageData, size: number): ImageData {
        const pixelized = pixelize0(imageData.data, size, imageData.width, imageData.height);
        imageData.data.set(new Uint8ClampedArray(pixelized));
        return imageData;
    }
}

export const pixelize0 = (data: Uint8ClampedArray, size: number, width: number, height: number): Uint8ClampedArray => {
    const halfSize = Math.floor(size * .5);

    for (let y = halfSize; y < height; y += size) {
        for (let x = halfSize; x < width; x += size) {
            const pixel = data[y * width + x];

            // Set the current pixel to the average color of all the pixels in the size x size block
            data[y * width + x] = getAverageColor(data, x - halfSize, y - halfSize, size, size, width);

            // Set all the pixels in the size x size block to the same color as the current pixel
            for (let i = -halfSize; i < halfSize && y + i < height; i++) {
                for (let j = -halfSize; j < halfSize && x + j < width; j++) {
                    data[(y + i) * width + (x + j)] = pixel;
                }
            }
        }
    }
    return data;
}


export const getAverageColor = (data: Uint8ClampedArray, x: number, y: number, width: number, height: number, stride: number): number => {
    let r = 0, g = 0, b = 0, a = 0;
    let count = 0;

    for (let i = y; i < y + height; i++) {
        for (let j = x; j < x + width; j++) {
            const index = i * stride + j;
            r += data[index];
            g += data[index + 1];
            b += data[index + 2];
            a += data[index + 3];
            count++;
        }
    }

    // Calculate the average color values
    r = Math.floor(r / count);
    g = Math.floor(g / count);
    b = Math.floor(b / count);
    a = Math.floor(a / count);

    // Return the average color as a single pixel value
    return (a << 24) | (r << 16) | (g << 8) | b;
}