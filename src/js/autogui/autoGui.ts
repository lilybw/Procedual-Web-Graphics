import { fillKeys, copy } from "../util/objUtil";

/**
 * Generates a GUI for the given object
 * @param userDefinedConfig Any altercations the user wants to make to the default config
 * @returns A div element containing the GUI
 */
export const getGui = (
        userDefinedConfig: AutoGuiConfig
    ): HTMLDivElement => {
    const guiRoot = document.createElement("div");

    //Much like the normal js way of going let variable = userDefinedConfig.variable || defaultConfig.variable
    //but more flexible. TS doesn't like it and it requires a lot of "!" but it works well
    const config = fillKeys(userDefinedConfig,copy(defaultConfig));

    guiRoot.id = "guiRoot";
    config.rootStyleFunction!(guiRoot);
    const title = document.createElement("h2");
    title.innerText = config.titleText ? config.titleText as string : config.object.constructor.name;
    guiRoot.appendChild(title);

    const subRoot = document.createElement("div");
    subRoot.id = "subRoot";
    config.gridStyleFunction!(subRoot);

    Object.keys(config.object).forEach((key: string, index: number) => {
        if (config.mask!.includes(key)) {
            return;
        }
        const inputLabelPair = document.createElement("div");
        const indexableKey = key as keyof typeof config.object;

        config.paramStyleFunction!(inputLabelPair);
        inputLabelPair.id = "param-"+index;

        const label = document.createElement("label");
        label.innerText = key;
        const input = document.createElement("input");
        input.type = approxHtmlInputType(config.object[indexableKey]);
        if(input.type === "slider"){
            input.min = "0";
            input.max = "100";
            input.step = "1";
        }

        input.value = config.object[indexableKey] as any;
        input.disabled = !config.isEditable;

        if(config.isEditable){
            config.triggerObjectUpdateOnEvents!.forEach((eventType: string) => input.addEventListener(eventType, (e: Event) => {
                console.log("autoGui updating object field: " + key + " to " + (e.target as HTMLInputElement).value);
                config.object[indexableKey] = attemptRealignDataStructure((e.target as HTMLInputElement).value, typeof config.object[indexableKey]) as any;
            }));
        }

        inputLabelPair.appendChild(label);
        inputLabelPair.appendChild(input);

        subRoot.appendChild(inputLabelPair);
    });
    guiRoot.appendChild(subRoot);

    return guiRoot;
}

function attemptRealignDataStructure(value: string, expectedType: string): any {
    switch (expectedType) {
        case "number":
            return Number(value);
        case "string":
            return String(value);
        case "boolean":
            return value === "true";
        default:
            return value;
    }
}


const approxHtmlInputType = (value: any): string => {
    switch (typeof value) {
        case "number":
            return "number";
        case "string":
            return "text";
        case "boolean":
            return "checkbox";
        default:
            return "text";
    }
};

const styleRoot = (root: HTMLDivElement) => {
    root.style.position = "relative";
    root.style.display="inline-block";
    root.style.top = "0";
    root.style.left = "0";
    root.style.flexDirection = "column";
    root.style.alignItems = "center";
    root.style.justifyContent = "space-between";
    root.style.backgroundColor = "rgba(255, 255,255, 0.5)";
}

const styleSubRoot = (root: HTMLDivElement) => {
    root.style.display = "grid";
    root.style.gridTemplateColumns = "1fr 1fr";
    root.style.flexDirection = "column";
    root.style.alignItems = "center";
    root.style.justifyContent = "space-between";
}

const styleParam = (param: HTMLDivElement) => {
    param.style.display = "flex";
    param.style.flexDirection = "column";
    param.style.alignItems = "center";
    param.style.justifyContent = "space-between";
}

export type AutoGuiConfig = {
    /**
     * The object to generate a GUI for
     */
    object: Object,
    /**
     * An array of keys to not include in the GUI
     * @default []
     */
    mask?: Array<string>,
    /**
     * Whether or not the GUI should be editable (and edit the object as well)
     * [EXPERIMENTAL]
     * @default false
     */
    isEditable?: boolean,
    /**
     * The text to display in the title
     * If undefined, the object's constructor name will be used
     * @default undefined
    */
    titleText?: string,
    triggerObjectUpdateOnEvents?: Array<string>,
    /**
     * A function to style the root div
     */
    rootStyleFunction?: (div: HTMLDivElement) => void,
    /**
     * A function to style the sub div's which contain pairs of inputs and their labels
     */
    gridStyleFunction?: (div: HTMLDivElement) => void,
    /**
     * A function to style the div's which contain a single input and its label
     */
    paramStyleFunction?: (div: HTMLDivElement) => void
}

const defaultConfig: AutoGuiConfig = {
    object: Object,
    mask: [],
    isEditable: false,
    titleText: undefined,
    triggerObjectUpdateOnEvents: ["blur","change"],
    rootStyleFunction: styleRoot,
    gridStyleFunction: styleSubRoot,
    paramStyleFunction: styleParam
}


