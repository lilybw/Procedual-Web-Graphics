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

    config.rootStyleFunction!(guiRoot);
    const title = document.createElement("h2");
    title.style.textAlign = "center";
    title.innerText = config.titleText ? config.titleText as string : config.object.constructor.name;
    guiRoot.appendChild(title);

    const subRoot = document.createElement("div");
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
        config.labelStyleFunction!(label);
        label.innerText = key;
        const input = document.createElement("input");
        config.inputStyleFunction!(input);
        input.type = approxHtmlInputType(config.object[indexableKey]);
        if(input.type === "slider"){
            input.min = "0";
            input.max = "100";
            input.step = "1";
        }
        input.value = config.object[indexableKey] as any;
        input.checked = config.object[indexableKey] as any as boolean;
        input.disabled = !config.isEditable;

        if(config.isEditable){
            config.triggerObjectUpdateOnEvents!.forEach((eventType: string) => input.addEventListener(eventType, (e: Event) => {
                const value: any = (e.target as HTMLInputElement).value;
                config.onBeforeUpdate!(config.object, indexableKey, value);
                config.object[indexableKey] = attemptRealignDataStructure(value, typeof config.object[indexableKey]);
                input.checked = Boolean(config.object[indexableKey] as any);
                config.onAfterUpdate!(config.object);
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
        case "array":
            return value.split(",");
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
    root.id = "guiRoot";
    root.style.position = "relative";
    root.style.display="inline-block";
    root.style.top = "0";
    root.style.left = "0";
    root.style.padding = "5px";
    root.style.flexDirection = "column";
    root.style.alignItems = "center";
    root.style.justifyContent = "space-between";
    root.style.backgroundColor = "rgba(255, 255,255, 0.5)";
}

const styleSubRoot = (subRoot: HTMLDivElement) => {
    subRoot.id = "subRoot";
    subRoot.style.display = "grid";
    subRoot.style.gridTemplateColumns = "1fr 1fr";
    subRoot.style.flexDirection = "column";
    subRoot.style.alignItems = "center";
    subRoot.style.justifyContent = "space-between";
}

const styleParam = (param: HTMLDivElement) => {
    param.style.display = "flex";
    param.style.flexDirection = "column";
    param.style.alignItems = "center";
    param.style.justifyContent = "space-between";
    param.style.marginBottom = "5px";
}

const styleInputAndLabel = (element: HTMLElement) => {
    element.style.textAlign = "center";
    element.style.margin = "0";
    element.style.padding = "0px";
    element.style.paddingTop = "5px";
    element.style.background = "hsla(0, 0%, 100%, 0.5)";
    element.style.width = "80%";

    element.style.borderWidth = "0px";
    element.style.outline = "none";
    element.style.borderBottomWidth = "1px";
    element.style.borderBottomColor = "black";

    element.style.borderRadius = "5px";
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
    /**
     * Which dom events should trigger the object to be updated
     * with what values are currently in the inputs.
     * @default blur & change
     */
    triggerObjectUpdateOnEvents?: Array<string>,
    /**
     * Fires after a dom event matching the triggerObjectUpdateOnEvents fires in the gui.
     * @param object The object that was updated
     * @returns 
     */
    onAfterUpdate?: (object: Object) => void,
    /**
     * Fires before a field in the object is updated.
     */
    onBeforeUpdate?: (object: Object, key: string, value: any) => void,
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
    inputStyleFunction?: (input: HTMLInputElement) => void,
    labelStyleFunction?: (label: HTMLLabelElement) => void
}

const defaultConfig: AutoGuiConfig = {
    object: Object,
    mask: [],
    isEditable: false,
    titleText: undefined,
    triggerObjectUpdateOnEvents: ["blur","change"],
    onAfterUpdate: (object: Object) => {},
    onBeforeUpdate: (object: Object, key: string, value: any) => {},
    rootStyleFunction: styleRoot,
    gridStyleFunction: styleSubRoot,
    paramStyleFunction: styleParam,
    labelStyleFunction: styleInputAndLabel,
    inputStyleFunction: styleInputAndLabel
}


