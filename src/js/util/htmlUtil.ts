export const clearChildren = (element: HTMLElement) => {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}