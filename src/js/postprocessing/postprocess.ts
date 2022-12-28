export default interface IPostProcess {
    new (width: number, height: number): IPostProcess;
}

export interface I2DBuffered {
    dataBuffer: Array<Uint8ClampedArray>;
}