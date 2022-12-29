

export const getGui = (object: Object, mask: String[] = [""], titleText?: String): HTMLDivElement => {
    const guiRoot = document.createElement("div");
    guiRoot.id = "guiRoot";
    styleRoot(guiRoot);
    const title = document.createElement("h2");
    title.innerText = titleText as string ? titleText as string : object.constructor.name;
    guiRoot.appendChild(title);

    const subRoot = document.createElement("div");
    subRoot.id = "subRoot";
    styleSubRoot(subRoot);

    Object.keys(object).forEach((key: string, index: number) => {
        if (mask.includes(key)) {
            return;
        }
        const div = document.createElement("div");
        styleParam(div);
        div.id = "param-"+index;

        const label = document.createElement("label");
        label.innerText = key;
        const input = document.createElement("input");
        input.type = approxType(object[key as keyof typeof object]);
        if(input.type === "slider"){
            input.min = "0";
            input.max = "100";
            input.step = "1";
        }

        input.value = object[key as keyof typeof object];
        input.addEventListener("change", (e: Event) => {
            object[key as keyof typeof object] = (e.target as HTMLInputElement).value;
        });

        div.appendChild(label);
        div.appendChild(input);

        subRoot.appendChild(div);
    });
    guiRoot.appendChild(subRoot);

    return guiRoot;
}

const approxType = (value: any): string => {
    if (typeof value === "number") {
        return "slider";
    }
    if (typeof value === "string") {
        return "text";
    }
    if (typeof value === "boolean") {
        return "checkbox";
    }
    return "text";
};

const styleRoot = (root: HTMLDivElement) => {
    root.style.position = "relative";
    root.style.top = "0";
    root.style.left = "0";
    root.style.display = "flex";
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