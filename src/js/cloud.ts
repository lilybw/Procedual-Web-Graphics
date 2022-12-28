//Author github.com/GustavBW
import type { Controller, CloudConfig, PelletInfo } from "./controller";
import { fillKeys, copy } from "./util/objUtil";


const defaultConfig: CloudConfig = {
    container: null,
    distributionType: "random",
    density: 0.1,
    minSize: 5,
    maxSize: 20,
    imgSource: null,
    pelletHSLA: (pellet: PelletInfo) => [0, 100, 100, 1],
}

export default class CloudController implements Controller{

    public config: CloudConfig;
    public cloudInfo: PelletInfo[] = [];
    public cloud: HTMLElement[] = [];

    public constructor(config: CloudConfig){
        const actualConfig = fillKeys(config, copy(defaultConfig));
        const error: string | null = this.verifyConfig(actualConfig);
        if (error !== null) {
            throw new Error(error);
        }
        this.config = actualConfig;
        this.normalizeConfig(this.config);
    }

    update = () => {};
    start = () => {
        let error = this.verifyConfig(this.config);
        if(error !== null){
            throw new Error(error);
        }
        
        let generatedCloud = null;

        switch(this.config.distributionType){
            case "grid":
                generatedCloud = this.generateGrid();
                break;
            case "random":
                generatedCloud = this.generateRandom();
                break;
            default:
                throw new Error("Invalid distribution type");
        }

        if(generatedCloud === null){
            throw new Error("Failed to generate cloud");
        }

        this.cloudInfo = generatedCloud;
        this.cloud.push(...this.toElements(generatedCloud));
        this.cloud.map((pellet) => this.config.container?.appendChild(pellet));
    };
    stop = () => {
        this.cloudInfo.length = 0;
        this.cloud.map((pellet) => pellet.remove());
    };

    private onUpdate = () => {
        this.cloud.map((pellet, index) => {
            const pelletInfo = this.cloudInfo[index];

            const color = this.config.pelletHSLA!(pelletInfo);

            pellet.style.backgroundColor = `hsla(${color[0]}, ${color[1]}%, ${color[2]}%, ${color[3]})`;
        });
    }

    private toElements = (cloud: PelletInfo[]): HTMLElement[] => {
        const container = this.config.container;
        if(container === null){
            throw new Error("No container specified");
        }
        const elements: HTMLElement[] = [];
        cloud.forEach((pellet) => {
            const element = document.createElement("div");
            element.style.position = "relative";
            element.style.left = pellet.x + "px";
            element.style.top = pellet.y + "px";
            element.style.width = pellet.size + "px";
            element.style.height = pellet.size + "px";

            const color = this.config.pelletHSLA!(pellet);

            element.style.backgroundColor = `hsla(${color[0]}, ${color[1]}%, ${color[2]}%, ${color[3]})`;
            elements.push(element);
        });
        return elements;
    }

    private generateGrid = () => {
        const cloud: PelletInfo[] = [];
        const container = this.config.container!;

        const width = container.clientWidth;
        const height = container.clientHeight;

        const increment = width * this.config.density!;

        let counter = 0;
        for(let x = 0; x < width; x += increment){
            for(let y = 0; y < height; y += increment){
                cloud.push({
                    x: x,
                    y: y,
                    originalPosition: [x,y],
                    size: Math.random() * (this.config.maxSize! - this.config.minSize!) + this.config.minSize!,
                    number: counter,
                    spawnMS: Date.now()
                });
                counter++;
            }
        }
        return cloud;
    }

    public generateRandom = () => {
        const cloud: PelletInfo[] = [];
        const container = this.config.container;
        if(container === null){
            throw new Error("No container specified");
        }
        const width = container.offsetWidth;
        const height = container.offsetHeight;
        const pelletCount = Math.floor((width * height * this.config.density!) / ((this.config.minSize! + this.config.minSize!) / 2));
        console.log(pelletCount);
        for(let i = 0; i < pelletCount; i++){
            let xy = [Math.random() * width, Math.random() * height]
            cloud.push({
                x: xy[0],
                y: xy[1],
                originalPosition: [xy[0],xy[1]],
                size: Math.random() * (this.config.maxSize! - this.config.minSize!) + this.config.minSize!,
                number: i,
                spawnMS: Date.now()
            });
        }
        return cloud;
    }

    verifyConfig = (config: any) => {
        if(config.container === null){
            return "No container specified";
        }    
        return null
    };
    normalizeConfig = (config: any) => {};


}