//Author: https://github.com/GustavBW

import type { Controller, ChexConfig, ArcInfo } from "./controller";
import { copy, fillKeys } from "./util/objUtil";
import {degreesToRadians} from "./util/vmath";
import {clearChildren} from "./util/htmlUtil";
import Pixelizor from "./postprocessing/pixelize";
import { path2DArrayFromFilepaths, path2DFromFilepath } from "./util/svgUtil";

const defaultConfig: ChexConfig = {
    container: null,
    minArcLength: 45,
    maxArcLength: 180,
    minArcWidth: 5,
    maxArcWidth: 15,
    arcHSLA: (arcInfo: ArcInfo) => [
        (Date.now() - arcInfo.spawnMS) / 100,
        100 - arcInfo.number,
        80 - arcInfo.number,
        1],
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
    onLineStartDraw: undefined,
    onLineEndDraw: undefined,
    onLineStartScalar: 1,
    onLineEndScalar: 1,
    massive: false,
    svgsOnly: false
}

export default class ChexController implements Controller{

    public config: ChexConfig;
    public field: ArcInfo[] = [];
    private fieldUpdateInterval: NodeJS.Timer | null = null;
    private ctx: CanvasRenderingContext2D | null = null;
    private pixelizor: Pixelizor;
    private isFrozen: boolean = false;
    private isRunning: boolean = false;

    constructor(config: ChexConfig){
        const actualConfig = fillKeys(config, copy(defaultConfig));
        const error: string | null = this.verifyConfig(actualConfig);
        if (error !== null) {
            throw new Error(error);
        }
        this.config = actualConfig;
        this.normalizeConfig(this.config);
        this.pixelizor = new Pixelizor(this.config.container!.offsetWidth, this.config.container!.offsetHeight);
    }
    
    /**
     * Updates the canvas and it's context.
     * Then updates the current arc field info.
     */
    public update = async () => {
        //update post process chain
        //update canvas and ctx
       
        //update field in place
        const newField = this.generateFieldInfo();
        const resizedField: ArcInfo[] = [];
        for(let i = 0; i < newField.length; i++){
            if(i < this.field.length){
                resizedField.push(
                    fillKeys(this.field[i], newField[i])
                    )
            }else{
                resizedField.push(newField[i]);
            }
            
        }
        this.clearField();
        this.field = resizedField;
    };

    public start = async () => {
        let error = this.verifyConfig(this.config);
        if(error !== null){
            throw new Error(error);
        }

        let canvas = this.prepareContainerAndGetCanvas();
        this.ctx = canvas.getContext("2d",{willReadFrequently: true});
        if(this.ctx === null){
            throw new Error("Could not get canvas context");
        }
       
        this.field = this.generateFieldInfo();

        let lastCallMs = Date.now();
        let currentGlobalRotation = 0;
        this.fieldUpdateInterval = setInterval(
            () => {
                this.evaluateField(Date.now() - lastCallMs, this.ctx as CanvasRenderingContext2D);
                lastCallMs = Date.now();
                this.config.container!.style.transform = `rotate(${currentGlobalRotation}deg)`;
                currentGlobalRotation += this.config.globalRotationSpeed!;
            }, 
            this.config.updateFrequency!
        );
    };

    public stop = async () => {
        this.clearField();
        if(this.fieldUpdateInterval !== null){
            clearInterval(this.fieldUpdateInterval);
        }
        clearChildren(this.config.container!);
    };

    private clearField = async () => {
        this.field.length = 0;
        this.ctx?.clearRect(0, 0, this.config.container!.offsetWidth, this.config.container!.offsetHeight);
    }

    private generateFieldInfo = (): ArcInfo[] => {
        const newField: ArcInfo[] = [];
        let onLineStartSVGs: Path2D[] = this.getPath2Ds(this.config.onLineStartDraw);
        let onLineEndSVGs: Path2D[] = this.getPath2Ds(this.config.onLineEndDraw);

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
                arcLengthDeg = this.normalizeArcLength(arcLengthDeg, currentCenterOffset);
            }
            arcLengthDeg *= arcRotationDirection;

            if(this.config.massive!){
                let ring = this.fillRing(
                        this.getArcInfoObject(i, arcLengthDeg,currentCenterOffset, arcSpeed, arcRotationDirection, 
                            onLineStartSVGs[Math.floor(Math.random() * onLineStartSVGs.length)],
                            onLineEndSVGs[Math.floor(Math.random() * onLineEndSVGs.length)]),
                        onLineStartSVGs, onLineEndSVGs);
                newField.push(...ring);
                i+=ring.length;
            }else{
                newField.push(this.getArcInfoObject(
                    i, arcLengthDeg,currentCenterOffset, arcSpeed, arcRotationDirection,
                    onLineStartSVGs[Math.floor(Math.random() * onLineStartSVGs.length)],
                    onLineEndSVGs[Math.floor(Math.random() * onLineEndSVGs.length)]));
            }
            
            currentCenterOffset += Math.random() * (this.config.maxArcSpacing! - this.config.minArcSpacing!) + this.config.minArcSpacing!;
        }
        return newField;
    }

    private getPath2Ds(svgPaths: string[] | string | undefined): Path2D[] {
        if(svgPaths === undefined){
            return [];
        }

        if(typeof svgPaths === "string"){
            //TODO: Fix the svg UTIL
            return [new Path2D(svgPaths as string)];
        }

        const svgs = [];
        for(let i = 0; i < svgPaths.length; i++){
            svgs.push(new Path2D(svgPaths[i]));
        }

        return svgs;
    }

    private fillRing = (mainArc: ArcInfo, onLineStartSvgs: Path2D[], onLineEndSvgs: Path2D[]): ArcInfo[] => {
        const toReturn: ArcInfo[] = [mainArc];
        let degreesLeft = 360 - mainArc.length;
        let latestArcInfo = mainArc;

        while(degreesLeft > 0){
            let newArcLength = Math.min(degreesLeft, Math.random() * (this.config.maxArcLength! - this.config.minArcLength!) + this.config.minArcLength!);
            if(this.config.normalizeArcLength!){
                newArcLength = this.normalizeArcLength(newArcLength, latestArcInfo.distanceFromCenter);
            }
            degreesLeft -= newArcLength;
            newArcLength *= latestArcInfo.clockwise ? 1 : -1;

            const newArc = this.getArcInfoObject(
                latestArcInfo.number + 1,
                newArcLength,
                latestArcInfo.distanceFromCenter,
                latestArcInfo.rotationSpeed,
                latestArcInfo.clockwise ? 1 : -1,
                onLineStartSvgs[Math.floor(Math.random() * onLineStartSvgs.length)],
                onLineEndSvgs[Math.floor(Math.random() * onLineEndSvgs.length)]
            );
            toReturn.push(newArc);
            
            latestArcInfo = newArc;
        }

        return toReturn;
    }

    private normalizeArcLength(length: number, radius: number): number{
        const radiusDiffFactor = radius / this.config.centerOffset!;
        length /= radiusDiffFactor == 0 ? 1 : radiusDiffFactor;
        //linearly increase the arc length to lessen the normalization effect
        //minus 1 because I feel like a normalizationScalar of 1 should have no effect, wheras 0 might feel like causing a bug.
        length += (this.config.lengthNormalizationScalar! - 1) * radiusDiffFactor;
        return Math.abs(length);
    }

    private getArcInfoObject(number: number, length: number, radius: number, rotationSpeed: number, rotationDirection: number, onLineStartSVG: Path2D, onLineEndSVG: Path2D): ArcInfo{
        return {
            number: number,
            length: length, 
            width: Math.random() * (this.config.maxArcWidth! - this.config.minArcWidth!) + this.config.minArcWidth!, 
            distanceFromCenter: radius, 
            currentAngle: this.config.scatter! ? Math.random() * 360 : 0,
            rotationSpeed: rotationSpeed, 
            clockwise: rotationDirection == 1 ? true : false,
            spawnMS: Date.now(),
            onLineStartSVG: onLineStartSVG,
            onLineEndSVG: onLineEndSVG
        };
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
            this.tickArc(arc,deltaMs);
        })
        
        if(this.config.svgsOnly!){
            this.field.forEach((arc: ArcInfo) => {
                const arcColor = this.config.arcHSLA!(arc);
                ctx.strokeStyle = `hsla(${arcColor[0]},${arcColor[1]}%,${arcColor[2]}%,${arcColor[3]})`;
                this.appendStartAndEndSVGs(ctx, center, arc, arc.clockwise ? 1 : -1);
            })
        }else{
            this.field.forEach((arc: ArcInfo) => {
                this.drawArc(ctx, center, arc);
                this.appendStartAndEndSVGs(ctx, center, arc, arc.clockwise ? 1 : -1);
            });
        }

        /*
        const currentData = ctx.getImageData(0, 0, ctx.canvas.offsetWidth, ctx.canvas.offsetHeight);
        const pixelizedData = this.pixelizor.pixelize(currentData, 40);
        ctx.putImageData(pixelizedData,0,0);
        */
    }

    private tickArc(arc: ArcInfo, deltaMs: number){
       arc.currentAngle += arc.rotationSpeed * (deltaMs / 1000);
    }

    private drawArc(ctx: CanvasRenderingContext2D, center: { x: number; y: number; }, arc: ArcInfo) {
            ctx.beginPath();
            let rotationDirection = arc.clockwise ? 1 : -1;
            ctx.arc(
                center.x,
                center.y,
                arc.distanceFromCenter,
                degreesToRadians(arc.currentAngle) * rotationDirection,
                degreesToRadians(arc.currentAngle + arc.length) * rotationDirection
            );
            ctx.lineWidth = arc.width;
            const arcColor = this.config.arcHSLA!(arc);
            ctx.strokeStyle = `hsla(${arcColor[0]},${arcColor[1]}%,${arcColor[2]}%,${arcColor[3]})`;
            ctx.stroke();
            ctx.closePath();
    }

    private appendStartAndEndSVGs = (ctx: CanvasRenderingContext2D, center : {x: number, y: number}, arc: ArcInfo, rotationDirection: number) =>{
        const startSvgPos = {
            x: center.x + (arc.distanceFromCenter - arc.width) * Math.cos(degreesToRadians(arc.currentAngle) * rotationDirection),
            y: center.y + (arc.distanceFromCenter - arc.width) * Math.sin(degreesToRadians(arc.currentAngle) * rotationDirection)
        }

        const endSvgPos = {
            x: center.x + (arc.distanceFromCenter - arc.width) * Math.cos(degreesToRadians(arc.currentAngle + arc.length) * rotationDirection),
            y: center.y + (arc.distanceFromCenter - arc.width) * Math.sin(degreesToRadians(arc.currentAngle + arc.length) * rotationDirection)
        }

        if(arc.onLineStartSVG ){
            this.fillOffsetSVG(ctx, arc.onLineStartSVG, startSvgPos, rotationDirection, arc);
        }
        if(arc.onLineEndSVG){
            this.fillOffsetSVG(ctx, arc.onLineEndSVG, endSvgPos, rotationDirection, arc);
        }
    }

    private fillOffsetSVG(ctx: CanvasRenderingContext2D, svg: Path2D, offset: {x:number,y:number}, rotationDirection: number, arc: ArcInfo){
        ctx.save();
        ctx.translate(offset.x, offset.y);
        if(rotationDirection === 1){
            ctx.rotate(degreesToRadians(arc.currentAngle) * rotationDirection);
        }else{
            ctx.rotate(degreesToRadians(arc.currentAngle + arc.length) * rotationDirection);
        }
        ctx.fillStyle = ctx.strokeStyle;
        ctx.scale(arc.width * this.config.onLineEndScalar!, arc.width * this.config.onLineEndScalar!);
        ctx.fill(svg);
        ctx.restore();
    }
    
    private prepareContainerAndGetCanvas = () => {
        let canvas = document.createElement("canvas");

        canvas.width = this.config.container!.offsetWidth;
        canvas.height = this.config.container!.offsetHeight;
        canvas.style.position = this.config.container!.style.position;
        canvas.style.top = this.config.container!.style.top;
        canvas.style.left = this.config.container!.style.left;

        this.config.container!.appendChild(canvas);
        return canvas;
    }

    public verifyConfig = (config: any) => {
        if(config.container === null || config.container === undefined) return "Chex container is null";   
        return null
    };
    public normalizeConfig = (config: any) => {};
}