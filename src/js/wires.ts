//Author: https://github.com/GustavBW

import type { WiresConfig, Controller } from "./controller";

const defaultConfig: WiresConfig = {
    container: null,
}

/**
 * Generates realtime, procedual wireframes based on either a given sample template or the default.
 */
export default class WiresController implements Controller{


    public update = () => {}
    public start = () => {}
    public stop = () => {}

    public verifyConfig = (config: any) => {
        return null;
    };

    public normalizeConfig = (config: any) => {};



}