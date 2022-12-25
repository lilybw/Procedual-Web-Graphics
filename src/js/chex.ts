//Author: https://github.com/GustavBW

import type { Controller, ChexConfig, ArcInfo } from "./controller";
import { copy, fillKeys } from "./objUtil";
import {degreesToRadians} from "./vmath";

const defaultConfig: ChexConfig = {
    container: null,
    minArcLength: 45,
    maxArcLength: 180,
    minArcWidth: 5,
    maxArcWidth: 15,
    minArcOpacity: 1,
    maxArcOpacity: 1,
    arcHSL: (arcInfo: ArcInfo) => [
        Math.sin(arcInfo.number / 20) * 25 + 30,
        Math.sin((arcInfo.currentAngle / 360) % 360) * 100,
        50],
    minArcSpacing: 10,
    maxArcSpacing: 10,
    maxArcCount: 55,
    centerOffset: 100,
    updateFrequency: 30,
    maxRotationSpeed: 200,
    minRotationSpeed: 20,
    scatter: true,
    backgroundColor: [300,100,50,1],
    globalRotationSpeed: 0,
    enableBackground: false,
    rotateBothWays: true,
    normalizeSpeed: true,
    speedNormalizationScalar: 1,
    normalizeArcLength: true,
    lengthNormalizationScalar: 2,
}

export default class ChexController implements Controller{

    private config: ChexConfig;
    private field: ArcInfo[] = [];
    private fieldUpdateInterval: NodeJS.Timer | null = null;
    private ctx: CanvasRenderingContext2D | null = null;

    constructor(config: ChexConfig){
        const actualConfig = fillKeys(config, copy(defaultConfig));
        const error: string | null = this.verifyConfig(actualConfig);
        if (error !== null) {
            throw new Error(error);
        }
        this.config = actualConfig;
        this.normalizeConfig(this.config);
    }
    public update = () => {

    };
    public start = () => {
        let error = this.verifyConfig(this.config);
        if(error !== null){
            throw new Error(error);
        }
        let canvas = this.prepareContainerAndGetCanvas();
        this.ctx = canvas.getContext("2d");
        if(this.ctx === null){
            throw new Error("Could not get canvas context");
        }

        this.generateFieldInfo();
        let lastCallMs = Date.now();
        let currentGlobalRotation = 0;
        this.fieldUpdateInterval = setInterval(
            () => {
                this.evaluateField(Date.now() - lastCallMs, this.ctx as CanvasRenderingContext2D);
                lastCallMs = Date.now();
                canvas.style.transform = `rotate(${currentGlobalRotation}deg)`;
                currentGlobalRotation += this.config.globalRotationSpeed!;
            }, 
            this.config.updateFrequency!
        );
    };

    public stop = () => {
        this.clearField();
        if(this.fieldUpdateInterval !== null){
            clearInterval(this.fieldUpdateInterval);
        }
        
    };

    private clearField = () => {
        this.field.length = 0;
        this.ctx?.clearRect(0, 0, this.config.container!.offsetWidth, this.config.container!.offsetHeight);
    }

    private generateFieldInfo = () => {
        this.clearField();
        let currentCenterOffset: number = this.config.centerOffset!;
        //E.g. while not having generated the max number of arcs and the current center offset is less than the width of the container
        for (let i = 0; 
                i < this.config.maxArcCount! 
                && currentCenterOffset < this.config.container!.offsetWidth 
                && currentCenterOffset < this.config.container!.offsetHeight; 
            i++) {

            let arcSpeed: number = Math.random() * (this.config.maxRotationSpeed! - this.config.minRotationSpeed!) + this.config.minRotationSpeed!;
            if(this.config.normalizeSpeed!){
                const normalizationFactor = Math.sqrt(((currentCenterOffset - this.config.centerOffset!) * this.config.speedNormalizationScalar!));
                arcSpeed /= normalizationFactor == 0 ? 1 : normalizationFactor;
            }

            let arcRotationDirection = 1;
            if(this.config.rotateBothWays!){
                arcRotationDirection = Math.random() > 0.5 ? 1 : -1;
            }

            let arcLengthDeg: number = Math.random() * (this.config.maxArcLength! - this.config.minArcLength!) + this.config.minArcLength!;
            if(this.config.normalizeArcLength!){
                const radiusDiffFactor = currentCenterOffset / this.config.centerOffset!;
                arcLengthDeg /= radiusDiffFactor == 0 ? 1 : radiusDiffFactor;
                //linearly increase the arc length to lessen the normalization effect
                //minus 1 because I feel like a normalizationScalar of 1 should have no effect. Wheras 0 might feel like causing a bug.
                arcLengthDeg += (this.config.lengthNormalizationScalar! - 1) * radiusDiffFactor;
                arcLengthDeg = Math.abs(arcLengthDeg);
            }
            arcLengthDeg *= arcRotationDirection;

            this.field.push({
                    number: i, 
                    length: arcLengthDeg,
                    width: Math.random() * (this.config.maxArcWidth! - this.config.minArcWidth!) + this.config.minArcWidth!,
                    distanceFromCenter: currentCenterOffset,
                    currentAngle: this.config.scatter! ? Math.random() * 360 : 0,
                    rotationSpeed: arcSpeed,
                    clockwise: arcRotationDirection == 1 ? true : false
                }
            );
            currentCenterOffset += Math.random() * (this.config.maxArcSpacing! - this.config.minArcSpacing!) + this.config.minArcSpacing!;
        }
    }

    private evaluateField = (deltaMs: number, ctx: CanvasRenderingContext2D) => {
        const bgColor = this.config.backgroundColor!;
        const center = {x: ctx.canvas.width / 2, y: ctx.canvas.height / 2};

        ctx.beginPath();
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.closePath();

        if(this.config.enableBackground!){
            ctx.beginPath();
            ctx.fillStyle = `hsla(${bgColor[0]},${bgColor[1]}%,${bgColor[2]}%,${bgColor[3]})`;
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.closePath();
        }

        this.field.forEach((arc: ArcInfo) => {
            ctx.beginPath();
            let rotationDirection = arc.clockwise ? 1 : -1;
            ctx.arc(
                center.x, 
                center.y, 
                arc.distanceFromCenter, 
                degreesToRadians(arc.currentAngle) * rotationDirection, 
                degreesToRadians(arc.currentAngle + arc.length) * rotationDirection
            );
            arc.currentAngle += arc.rotationSpeed * (deltaMs / 1000);
            ctx.lineWidth = arc.width;
            const arcColor = this.config.arcHSL!(arc);
            ctx.strokeStyle = `hsla(${arcColor[0]},${arcColor[1]}%,${arcColor[2]}%,${Math.random() * (this.config.maxArcOpacity! - this.config.minArcOpacity!) + this.config.minArcOpacity!})`;
            ctx.stroke();
            ctx.closePath();
        });
    }

    private prepareContainerAndGetCanvas = () => {
        let canvas = document.createElement("canvas");
        canvas.width = this.config.container!.offsetWidth;
        canvas.height = this.config.container!.offsetHeight;
        this.config.container!.appendChild(canvas);
        return canvas;
    }

    public verifyConfig = (config: any) => {
        if(config.container === null) return "Chex container is null";   
        return null
    };
    public normalizeConfig = (config: any) => {};


}