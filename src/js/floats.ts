// Author: https://github.com/GustavBW

import { scaleVector, dotProduct, degreesToRadians, vectorMagnitude, projectVector } from "./util/vmath";
import { copy, fillKeys } from "./util/objUtil";
import type { Controller, FloatsConfig } from "./controller";



const defaultConfig: FloatsConfig = {
    travelTime: 20_000, // How many milliseconds it takes a square to cross the screen
    generationSpeed: 100, // How many milliseconds between each square generation.
    maxSquareSize: 400, // The maximum size of the squares in pixels
    squareMinOpacity: 0.3, // The minimum opacity of the squares
    squareMaxOpacity: 0.6, // The maximum opacity of the squares
    squareMinSize: 10, // The minimum size of the squares in pixels
    fadeStartTime: 10_000, // The time in ms it takes for the squares to fade out
    fadeSpeed: 2000, // travelTime - fadeStartTime = when the square starts to fade out
    baseColorHS: [270, 100, 0], // The base color of the squares HSL format
    travelVector: [0, 1], // The direction the squares travel in
    sunAngle: 45, // The angle of the sun in degrees.
    sunHueAlteration: 30, // The hue of the sun in relation to the set baseColorHS.
    sunIntensity: 0.5, // How much the sun affects the lightness (value) of the color of the highlight.
    useSun: false, 
    sunHighlightScalar: (width) => Math.min(width * .1 , 30),
    fullColor: true,
    zIndex: 10, 
    container: null,
    advanced: {
        htmlType: "div",
        htmlClass: "floats-square",
        htmlId: "",
        src: ""
    }
}



/**
 * @param config The configuration for the FloatsController
 * Known issue: At times getComputedStyle will return null, causing the squares to not be generated.
 */
export default class FloatsController implements Controller {
    public config: FloatsConfig;
    private active: boolean = false;
    public isActive = () => this.active;
    private squares: HTMLElement[] = [];
    private generationInterval: NodeJS.Timer | undefined;
    private cleanUpInterval: NodeJS.Timer | undefined;
    private stateCache = {
        offsetRadius: 1,
        containerDim: [1,1]
    }

    public normalizeConfig = (config: FloatsConfig) => {

        const mag = vectorMagnitude(config.travelVector!);
        config.travelVector![0] /= mag;
        config.travelVector![1] /= mag;
        
    }
    public verifyConfig = (config: FloatsConfig): string | null => {

        if (config.squareMinOpacity! > config.squareMaxOpacity!) {
            return ("squareMinOpcacity cannot be greater than squareMaxOpacity");
        }
        if (config.squareMinSize! > config.maxSquareSize!) {
            return ("squareMinSize cannot be greater than maxSquareSize");
        }
        if (config.baseColorHS!.length < 2) {
            return ("baseColorHS must be an array of at least length 2");
        }
        if (config.container === undefined || config.container === null) {
            return ("container must be defined");
        }
        return null;
    }

    constructor(config: FloatsConfig){
        const actualConfig = fillKeys(config, copy(defaultConfig));
        const error: string | null = this.verifyConfig(actualConfig);
        if (error !== null) {
            throw new Error(error);
        }
        this.config = actualConfig;
        this.normalizeConfig(this.config);
        this.config.container!.style.zIndex = (this.config.zIndex! - 10 ).toString();
        this.config.container!.style.transformStyle = "preserve-3d";
        this.config.container!.style.transform = "translateZ(-2px)"
    }

    public stop() {
        clearInterval(this.generationInterval);
        clearInterval(this.cleanUpInterval);
        this.active = false;
    }

    public clear(){
        this.squares.map((obj) => {
            obj.remove();
        });
        this.squares = [];
    }

    /**
     * Assures that all values are up to date. 
     * This should be called if the container is resized.
     */
    public update(){
        const currentDim = [
            // @ts-ignore
            parseInt(getComputedStyle(this.config.container).width),
            // @ts-ignore
            parseInt(getComputedStyle(this.config.container).height)
        ];
        if(!(currentDim[0] === 0 && Number.isNaN(currentDim[0]))){
            this.stateCache.containerDim[0] = currentDim[0];
        }
        if (!(currentDim[1] === 0 && Number.isNaN(currentDim[1]))) {
            this.stateCache.containerDim[1] = currentDim[1];
        }
        
        this.stateCache.offsetRadius = Math.sqrt(
            Math.pow(this.stateCache.containerDim[0], 2) + Math.pow(this.stateCache.containerDim[1], 2)
        );
    }

    public freeze () {
        clearInterval(this.generationInterval);
        clearInterval(this.cleanUpInterval);
        this.squares.map((obj) => {
            obj.style.top=getComputedStyle(obj).top;
            obj.style.left=getComputedStyle(obj).left;
            obj.style.opacity=getComputedStyle(obj).opacity;
            obj.dataset.timeOfDeath = (Date.now() + 300_000).toString();
        })
        this.active = false;
    }

    public start() {
        if(this.active) return;
        this.active = true;

        let error = this.verifyConfig(this.config);
        if (error !== null) {
            throw new Error(error);
        }
        this.update();

        this.cleanUpInterval = setInterval(() => {
            const now: number = Date.now();
            this.squares.map((obj, index) => {
                const timeOfDeath: number = parseInt(obj.dataset.timeOfDeath ? obj.dataset.timeOfDeath : "0");
                if (now > timeOfDeath)  {
                    this.squares.splice(index, 1);
                    obj.style.opacity = "0";
                    setTimeout(() => {
                        obj.remove();
                        //@ts-ignore
                    }, this.config.fadeSpeed);
                }
            });
        },this.config.generationSpeed);

        this.generationInterval = setInterval(() => {
            //@ts-ignore
            const square = this.generateSquare(this.config); 
            setTimeout(() => {
                square.style.top = `${square.dataset.endY}px`;
                square.style.left = `${square.dataset.endX}px`;
                
            }, 0); // This is a way to force the browser to render the square before it starts to float.
            this.squares.push(square);
        },this.config.generationSpeed)

    }

    private getRandomUrl(listOrString: string | string[]): string {
        if(typeof listOrString === "string"){
            return listOrString;
        }
        return listOrString[Math.floor(Math.random() * listOrString.length)];
    }
    private generateSquare(config: FloatsConfig): HTMLElement {
        if(!config.container) throw Error("FloatsController - Invalid Container");

        let [square, isImage] = this.setAdvanced();

        const squareSize = Math.min(
             Math.random() * this.config.maxSquareSize! + this.config.squareMinSize!, 
             this.config.maxSquareSize!
        );
        square.style.width = `${squareSize}px`;
        square.style.height = `${squareSize}px`;
        square.style.borderRadius = "10%";

        square.style.transition = `top ${this.config.travelTime! / 1000}s ease-in, left ${this.config.travelTime! / 1000}s ease-in,  opacity ${this.config.fadeSpeed! / 1000}s ease-in`;

        this.setColorsAndSun(square, isImage);
        
        const positions: {start: number[], end: number[]} = this.getStartEndPositions(
            this.config.travelVector!
        );

        square.style.left = `${positions.start[0]}px`; // Random position on the x-axis
        square.style.top = `${positions.start[1]}px`; // Random position on the y-axis
        square.dataset.endX = `${positions.end[0]}`; // Read once when the square is generated.
        square.dataset.endY = `${positions.end[1]}`;

        //@ts-ignore 
        square.dataset.timeOfDeath = `${Date.now() + (this.config.travelTime - this.config.fadeStartTime)}`;
        this.config.container?.appendChild(square);
        return square;
    }

    private setColorsAndSun(square: HTMLElement, isImage: boolean) {
        const hsl = [this.config.baseColorHS![0], this.config.baseColorHS![1], Math.min(Math.random() + this.config.squareMinOpacity!, this.config.squareMaxOpacity!) * 100];
        const baseColor = `hsl(${hsl[0]}, ${hsl[1]}%,${hsl[2]}%)`;

        if(this.config.useSun){
            let sunWrapper = this.getSunWrapper(hsl, square);
            square.style.transformStyle = "preserve-3d";
            sunWrapper.style.transform = "translateZ(-1px)"
            square.appendChild(sunWrapper);
        }

        if (!isImage) {
            square.style.backgroundColor = baseColor;
        } else {
            square.style.fill = baseColor;
            square.style.fillOpacity = "1";
            square.style.fillRule = "evenodd";
        }
        square.style.position = "absolute";
        square.style.zIndex = this.config.zIndex ? this.config.zIndex.toString() : "10";
        if (!this.config.fullColor) {
            square.style.opacity = `${Math.min(Math.random() + this.config.squareMinOpacity!, this.config.squareMaxOpacity!)}`;
        }
    }

    private getSunWrapper(baseColor: number[], square: HTMLElement): HTMLElement {
        const child = square.cloneNode() as HTMLElement;
        //One could choose to use offsetWidth and offsetHeight instead of style.width and style.height
        //but as the square is not rendered at this point, there is no computed style.
        const [width, height] = [parseInt(square.style.width), parseInt(square.style.height)];

        const sunAngleAsVec = [
            Math.cos(degreesToRadians(this.config.sunAngle!)),
            Math.sin(degreesToRadians(this.config.sunAngle!))
        ];

        const sunOffsetScalar = [this.config.sunHighlightScalar!(width), this.config.sunHighlightScalar!(height)];
        const sunOffset = [sunAngleAsVec[0] * sunOffsetScalar[0], sunAngleAsVec[1] * sunOffsetScalar[1]];

        //Regardless of the sign of sunOffset, we always want to alter the width and height accordingly
        child.style.width = (width + Math.abs(sunOffset[0])).toString() + "px";
        child.style.height = (height + Math.abs(sunOffset[1])).toString() + "px";

        //Only if the sunoffset is negative, we need to adjust the margins.
        //in other cases, the "highlight" is just the width/height difference
        if(sunOffset[0] < 0) {
            child.style.marginLeft = `${sunOffset[0]}px`;
        }
        if(sunOffset[1] < 0) {
            child.style.marginTop = `${sunOffset[1]}px`;
        }

        child.style.borderRadius = square.style.borderRadius;
        child.style.transition = square.style.transition;
        child.style.backgroundColor = `hsl(${baseColor[0] + this.config.sunHueAlteration!}, ${baseColor[1]}%,${Math.min(baseColor[2] + (this.config.sunIntensity! * 100),100)}%)`;

        return child;
    }

    private getStartEndPositions(vec: number[]): {start: number[], end: number[]}
    {   
        //This function works by concidering the initial spawn location as a point on a circle sourrounding the container.
        //It then takes the ortagonal vector and varies it by a certain factor given from
        //how much of each side of the container is visible from the spawn location. This projection factor
        //is then used to scale the ortagonal vector to a varied length, at which point you have the start location.
        const offsetRadius = Math.sqrt(this.stateCache.containerDim[0] ** 2 + this.stateCache.containerDim[1] ** 2);
        const orthoVec = [-vec[1], vec[0]]; // clockwise rotation of vec by 90 degrees
        const scalarFactor = Math.random();
        const orthVecContainerProjectionFactorX = projectVector([this.stateCache.containerDim[0], 0], scaleVector(orthoVec, this.stateCache.containerDim));
        const orthVecContainerProjectionFactorY = projectVector([0, this.stateCache.containerDim[1]], scaleVector(orthoVec, this.stateCache.containerDim));
        const orthVecScalar = [
            orthVecContainerProjectionFactorX * scalarFactor * this.stateCache.containerDim[0], 
            orthVecContainerProjectionFactorY * scalarFactor * this.stateCache.containerDim[1]
        ];
        //TODO: Now move the starting point to the closest edge of the container along vec

        return {
            start: [
                vec[0] * offsetRadius + orthoVec[0] * orthVecScalar[0],
                vec[1] * offsetRadius + orthoVec[1] * orthVecScalar[1]
                ],
            end: [
                -1 * vec[0] * offsetRadius + orthoVec[0] * orthVecScalar[0],
                -1 * vec[1] * offsetRadius + orthoVec[1] * orthVecScalar[1]
            ]
        };
    }



    private setAdvanced(): [HTMLElement, boolean]
    {
        let isImage: boolean = false;
        const square = document.createElement(
            //@ts-ignore
            this.config.advanced.htmlType
        );
        if (this.config.advanced?.htmlType === "img") {
            isImage = true;
            (square as HTMLImageElement).src = this.getRandomUrl(this.config.advanced.src);
        }
        square.classList.add("floaty");
        if (this.config.advanced?.htmlClass !== "") {
            //@ts-ignore
            square.classList.add(this.config.advanced.htmlClass);
        }
        if (this.config.advanced?.htmlId !== "") {
            //@ts-ignore
            square.id = this.config.advanced.htmlId;
        }
        return [square, isImage];
    }
}