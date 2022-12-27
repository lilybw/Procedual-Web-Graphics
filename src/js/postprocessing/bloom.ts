import { pixelize } from './pixelize';
import { mapToRange } from '../util/mappingmath';

/**
 * Takes the data of the context, then pixelizes it in multiple passes
 * @param canvasContext 
 * @param size how big the bloom should be. 
 * @param passes how many bloom passes should be done.
 * @param strength amount of passes aswell as size of bloom.
 * @param interpolation how much each pass value should affect the original data
 */
export const applyBloom = (canvasContext: CanvasRenderingContext2D, strength: number, size: number, interpolation: number, passes: number) => {

    canvasContext.putImageData(
        bloom(
            canvasContext.getImageData(0, 0, canvasContext.canvas.width, canvasContext.canvas.height),
            canvasContext.canvas.width,
            canvasContext.canvas.height,
            strength,
            interpolation,
            size,
            passes
        ),
    0, 0);
}

export const bloom = (imageData: ImageData, width: number, height: number, strength: number,interpolation: number, size:number,passes:number): ImageData => {
    const ogData = new Uint8ClampedArray(imageData.data);
    imageData.data.set(imageData.data);

    


    //canvasContext.putImageData(
     //   pixelize(imageData, width, height, 2),
       // 0, 0);
       return imageData;
}

 const calculateNewColor = (ogColor: number, bloomedColor: number, scew: number): number => {
    return mapToRange(
        (ogColor + bloomedColor ** scew) / 2,
    0,255); 
 }

