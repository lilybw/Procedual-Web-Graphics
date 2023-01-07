import fs from 'fs';	

/**
 * Reads a file of the .svg format and returns a Path2D object
 * with that path.
 * SERVESIDE ONLY - until i fix this
 * @param path string
 * @param parser optional
 * @returns Path2D, or an empty Path2D if the file could not be read
 */
export const path2DFromFilepath = (path: string, parser: DOMParser = new DOMParser()): Path2D => {
    const file = fs.readFile(path, (err, data) => {
        if(err){
            console.error(err);
            return null;
        }
        return data;
        });

    if(file === null || file === undefined){
        console.error("Failed to read svg file at path: " + path);
        return new Path2D();
    }

    const svgDoc = parser.parseFromString(file, "image/svg+xml");
    const pathElement = svgDoc.querySelector("path") as SVGPathElement;
    const d = pathElement.getAttribute("d");

    return new Path2D(d as string);
}

/**
 * Reads a list of filepaths and returns an array of Path2D objects
 * SERVESIDE ONLY - until i fix this
 * @param paths string[]
 * @returns Path2D[]
 */
export const path2DArrayFromFilepaths = (paths: string[]): Path2D[] => {
    const pathObjects = [];
    const parser = new DOMParser();

    for(let i = 0; i < paths.length; i++){
        pathObjects.push(path2DFromFilepath(paths[i],parser));
    }

    return pathObjects;
}