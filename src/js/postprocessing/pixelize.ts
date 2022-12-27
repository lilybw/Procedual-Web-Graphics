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
        this.dataBuffer.map((uint8Array, index) => uint8Array = new Uint8ClampedArray(width));
    }

    public pixelize(imageData: ImageData, size: number): ImageData {
        this.dataBuffer = fill2DArray(imageData.data, this.dataBuffer,this.width,this.height);
        imageData.data.set(fill1DArray(pixelize(this.dataBuffer,size),imageData.data));
        return imageData;
    }
}

export const pixelize = (data: Uint8ClampedArray[], size: number): Uint8ClampedArray[] => {
    //remember to start the pixelisation from the middle of the size
    //so that the pixelisation is centered
    const halfSize = Math.floor(size * .5);

    for (let y = halfSize; y < data.length; y += size) {
        for (let x = halfSize; x < data[y].length; x += size) {
            const pixel = data[y][x];
            
            for (let i = 0; i < size; i++) {
                for (let j = 0; j < size; j++) {
                    data[y - halfSize + i][x - halfSize + j] = pixel;
                }
            }
        }
    } 

    return data;
}