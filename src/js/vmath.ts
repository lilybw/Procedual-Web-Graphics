
export const degreesToRadians = (degrees: number) => degrees * Math.PI / 180;

export const dotProduct = (vec2: number[], vec1: number[]): number => vec1[0] * vec2[0] + vec1[1] * vec2[1];

export const scaleVector = (vec: number[], vec2: number[]): number[] => [vec[0] * vec2[0], vec[1] * vec2[1]];

export const vectorMagnitude = (vec: number[]): number => Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1]);

export const projectVector = (vec: number[], vec2: number[]): number => {
    const dot = dotProduct(vec, vec2);
    const mag = vectorMagnitude(vec2);
    return dot / (mag * mag);
}