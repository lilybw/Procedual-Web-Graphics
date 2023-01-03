import { copy, fillKeys } from '../util/objUtil';
import type HTMLDistributor from './distributor';

export interface RadialDistributorConfig {
    center: { x: number, y: number };
    rings: {radius: number, elements: HTMLElement[]}[];
}

const defaultConfig: RadialDistributorConfig = {
    center: { x: 500, y: 500 },
    rings: []
};

export default class RadialDistributor implements HTMLDistributor {
    public config: RadialDistributorConfig;

    constructor(config: RadialDistributorConfig) {
        this.config = fillKeys(config, copy(defaultConfig));
        this.distribute();
    }

    public distribute = (): HTMLDivElement => {
        const root = document.createElement("div");
        root.style.position = "absolute";
        root.style.top = `${this.config.center.y}px`;
        root.style.left = `${this.config.center.x}px`;
        root.style.display = "flex";
        return this.distribute0(root);
    }

    private distribute0 = (root: HTMLDivElement): HTMLDivElement => {
        
        return root;
    }
}