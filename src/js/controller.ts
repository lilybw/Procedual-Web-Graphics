//Author: github.com/GustavBW
export type Controller = {
    /**
     * Updates any cache the controller has.
     */
    update:  () => void;
    /**
     * Starts the simulation
     */
    start: () => void;
    /**
     * Stops the simulation
     */
    stop: () => void;
    /**
     * Stops the simulation and removes all content generated
     * @param config The config to verify
     * @returns null if the config is valid, otherwise a string describing the error
     */
    verifyConfig: (config: any) => string | null;
    /**
     * Normalizes any variables in the config that need to be normalized
     * Not just vectors.
     * @param config The config to normalize
     */
    normalizeConfig: (config: any) => void;
}

export interface Contained {
    container: HTMLElement | null;
}

export interface FloatsConfig extends Contained {
    /**
     * How many milliseconds it takes a square to cross the screen
     */
    travelTime?: number;
    /**
     * The direction the squares travel in
     * [0, -1] is up, [0, 1] is down, [1, 0] is right, [-1, 0] is left
     */
    travelVector?: number[];
    /**
     * How many milliseconds between each square generation.
     */
    generationSpeed?: number;
    /**
     * The maximum size of the squares in pixels
     */
    maxSquareSize?: number;
    /**
     * The minimum opacity of the squares
     */
    squareMinOpacity?: number;
    /**
     * The maximum opacity AND lightness of the squares
     */
    squareMaxOpacity?: number;
    /**
     * The minimum size of the squares in pixels
     */
    squareMinSize?: number;
    /**
     * From how many seconds away from being completely off screen the square starts to fade out
     * travelTime - fadeStartTime = when the square starts to fade out
     */
    fadeStartTime?: number;
    /**
     * The time in ms it takes for the squares to fade out
     */
    fadeSpeed?: number;
    /**
     * Hue and Saturation of the squares HSL format
     * Lightness (or Value) is calculated based on the opacity of the square
     * regardless of wether or not fullColor is true
     */
    baseColorHS?: number[];
    /**
     * If true, the squares will not vary in opacity.
     * Enables useSun, sunAngle, sunHueAlteration, and sunIntensity
     */
    fullColor?: boolean;
    /**
     * Requres that fullColor is enabled
     */
    useSun?: boolean;
    /**
     * The angle of the sun in degrees.
     */
    sunAngle?: number;
    /**
     * The hue of the sun in relation to the set baseColorHS.
     */
    sunHueAlteration?: number;
    /**
     * How much the sun affects the lightness (value) of the color of the highlight.
     * In a range from 0 to 1
     */
    sunIntensity?: number;
    /**
     * The physical size of the sun-based highlight in relation to the size of the square.
     */
    sunHighlightScalar?: (width: number) => number;
    zIndex?: number;
    /**
     * The container to put the squares in.
     * It is recommended that overflow is disabled for this element,
     * and that the update() method is called if this element is resized.
     */
    container: HTMLElement | null;
    /**
     * Advanced options
     */
    advanced?: {
        htmlType: string;
        htmlClass: string;
        htmlId: string;
        src: string | string[];
    };
}
export type ArcInfo = {
    number: number;
    length: number;
    width: number;
    /**
     * Also known as the radius of the arc.
     */
    distanceFromCenter: number;
    /**
     * The current angle offset around the center.
     * Is updated <ChexConfig.updateFrequency> times per second.
     */
    currentAngle: number;
    /**
     * In degrees per second. Assigned when the field is generated.
     */
    rotationSpeed: number;
    clockwise: boolean;
    /**
     * The timestamp of the creation of this arc info object.
     */
    spawnMS: number;
    onLineStartSVG: Path2D;
    onLineEndSVG: Path2D;
}
export interface ChexConfig extends Contained {
    container: HTMLElement | null;
    /**
     * The minimum length of an arc given in degrees
     */
    minArcLength?: number;
    /**
     * The maximum length of an arc given in degrees
     */
    maxArcLength?: number;
    /**
     * The minimum width of an arc given in pixels
     */
    minArcWidth?: number;
    /**
     * The maximum width of an arc given in degrees
     */
    maxArcWidth?: number;
    /**
     * The minimum number of pixels between arcs
     */
    minArcSpacing?: number;
    /**
     * The maximum number of pixels between arcs
     */
    maxArcSpacing?: number;
    /**
     * The maximum number of archs that can be generated
     */
    maxArcCount?: number;
    /**
     * The offset from the center of the container, in pixels, the arcs will begin to be generated.
     * Effectively leaving a empty hole in the center of the container.
     */
    centerOffset?: number;
    /**
     * How many times a second the field should be updated
     */
    updateFrequency?: number;
    /**
     * Maximum rotation speed in degrees per second
     */
    maxRotationSpeed?: number;
    /**
     * Minimum rotation speed in degrees per second
     */
    minRotationSpeed?: number;
    /**
     * Normalizes the degrees per second rotation of an arc so that two arcs
     * with different distances to the center will move the same amount of pixels per second.
     */
    normalizeSpeed?: boolean;
    /**
     * The scalar used to normalize the speed of an arc in regards to its distance to the center.
     * Lowering this value towards 0 will lessen the normalization effect.
     */
    speedNormalizationScalar?: number;
    /**
     * Wether or not the arcs should be randomly scattered around the container or start in a single line.
     * Default: true;
     */
    scatter?: boolean;
    /**
     * The rotation speed of the entire field in degrees per second
     */
    globalRotationSpeed?: number;
    /**
     * The background color of the field as an array of length 4 representing an hsla color.
     * (Hue, Saturation, Lightness, Alpha)
     * Default: transparent.
     */
    backgroundColor?: number[];
    enableBackground?: boolean;
    /**
     * Will allow some arcs to rotate in the opposite direction of the rest of the field.
     * Default: true
     */
    rotateBothWays?: boolean;
    /**
     * Normalizes the length of an arc so that two arcs with different distances to the center will have the same length.
     */
    normalizeArcLength?: boolean;
    /**
     * The scalar used to normalize the length of an arc in regards to its distance to the center.
     * Increasing this value from 1 will lessen the normalization effect.
     * Lowering this value from 1 towards 0 will cause the lengths of arcs to shrink towards a mid point, then grow again.
     * A value of 0 will place the aformentioned mid point at the center between the centerOffset and the actual size of the arc field.
     * Default: 1
     */
    lengthNormalizationScalar?: number;
    /**
     * Fills all the rings with arcs of the same width. No gaps between arcs.
     * Do bare in mind that this can be computationally expensive depending on the size of the field.
     */
    massive?: boolean;
    /**
     * Path to SVG element(s) to be drawned at the very start of the arc. 
     * If used with an array of string, a random one will be chosen for each arc.
     */
    onLineStartDraw?: string | string[],
    /**
     * Path to SVG element(s) to be drawned at the very end of the arc. 
     * If used with an array of string, a random one will be chosen for each arc.
     */
    onLineEndDraw?: string | string[],
    /**
     * Scalar used alongside the arcWidth to determine the scale of the SVG element(s) drawn at the start of the arc.
     */
    onLineStartScalar?: number;
    /**
     * Scalar used alongside the arcWidth to determine the scale of the SVG element(s) drawn at the start of the arc.
     */
    onLineEndScalar?: number;
    /**
     * Wether or not to only draw the provided svg paths and not the arcs themselves.
     */
    svgsOnly?: boolean;

    /**
     * A function that given a set of parameters returns a number array of length 4 representing the HSLA color of the arc.
     * This color is evaulated every frame of the simulation so be aware of performance.
     * @param ArcInfo information about the arc.
     * @returns a number array of length 4 representing the HSLA color of the arc
     */
    arcHSLA?: (arcInfo: ArcInfo) => number[];
}
export interface WiresConfig extends Contained {
    container: HTMLElement | null;
}

export type PelletInfo = {
    number: number, 
    x: number,
    y: number,
    originalPosition: number[],
    size: number,
    spawnMS: number
}

export interface CloudConfig extends Contained {
    container: HTMLElement | null;
    distributionType?: String;
    density?: number;
    minSize?: number;
    maxSize?: number;
    simSpeed?: number;
    massive?: boolean;
    imgSource?: string | string[] | null;
    pelletHSLA?: (pellet: PelletInfo) => number[],
}