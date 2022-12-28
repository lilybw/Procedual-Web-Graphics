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
        this.dataBuffer = fill2DArray(imageData.data, this.dataBuffer,this.width,this.height);
        const pixelizedData = pixelize0(this.dataBuffer,size);
        imageData.data.set(fill1DArray(pixelizedData,imageData.data));
        return imageData;
    }
}

export const pixelize0 = (data: Uint8ClampedArray[], size: number): Uint8ClampedArray[] => {
    //remember to start the pixelisation from the middle of the size
    //so that the pixelisation is centered
    const halfSize = Math.floor(size * .5);

    for (let y = halfSize; y < data.length; y += size) {
        for (let x = halfSize; x < data[y].length; x += size) {
            const pixel = data[y][x];
            
            for (let i = -halfSize; i < halfSize && y + i < data.length; i++) {
                for (let j = -halfSize; j < halfSize && x + j < data[y].length; j++) {
                    data[y + i][x + j] = pixel;
                }
            }
        }
    } 

    return data;
}