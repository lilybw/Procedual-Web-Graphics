import type { Controller } from './controller';
import type { VoronoiConfig } from './controller';
import { copy, fillKeys } from './util/objUtil';


const defaultConfig: VoronoiConfig = {
    container: null,
    static: false,
    pointCount: 10
};

type Point = {x:number,y:number};

/**
 * The fastest way to brick production! (Use sparingly)
 * @param config The configuration for the VoronoiController
 */
export default class VoronoiController implements Controller {

    private config: VoronoiConfig;
    private pointCloud: Point[] = [];

    constructor(config: any){
        const actualConfig = fillKeys(config, copy(defaultConfig));
        const error: string | null = this.verifyConfig(actualConfig);
        if (error !== null) {
            throw new Error(error);
        }
        this.config = actualConfig;
        this.normalizeConfig(this.config);
        
        for(let i = 0; i < this.config.pointCount!; i++){
            this.pointCloud.push({x:Math.random(),y:Math.random()});
        }
    }
    
    update = () => {

    };
    start = () => {
        
    };
    stop = () => {

    };
    verifyConfig = (config: any): string | null => {
        return null;
    }
    normalizeConfig = (config: any) => {

    };

    updateCanvas = (ctx: CanvasRenderingContext2D, width: number, height: number, frame: number) => {
        
    
    }


}