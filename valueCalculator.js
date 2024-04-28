if ("function" === typeof(importScripts)) {
    importScripts("https://cdn.jsdelivr.net/npm/mathjs@12.3.2/lib/browser/math.min.js");
}

const xStart = -10.0;
const xEnd = 10.0;
const yStart = -10.0;
const yEnd = 10.0;
const space = 0.1;

self.onmessage = (msg) => {
    try {
        const xTransform = msg.data.xTransform;
        const yTransform = msg.data.yTransform;
        const equation = msg.data.equation;
        const coordType = msg.data.coordType;

        const xyVals = new Map();
        const uvVals = new Map();

        getFirstVals(xyVals, uvVals, equation, coordType);
        getSecondVals(xyVals, uvVals, equation, xTransform, yTransform, coordType);

        self.postMessage({
            xyVals: Object.entries(xyVals),
            uvVals: Object.entries(uvVals)
        });
    } catch (e) {
        self.postMessage({
            e: e
        });
    }
}

const getExpr = (new_equation) => {
    const index = new_equation.indexOf("=");

    if (index == -1) {
        return;
    }

    const rightSide = new_equation.substring(new_equation.indexOf("=") + 1);
    return new_equation.substring(0, index) + "-(" + rightSide + ")";
}

const getFirstVals = (xyVals, uvVals, equation, coordType) => {
    let expr;

    if (coordType == "uv") {
        if (equation.indexOf('u') == -1 && equation.indexOf('v') == -1) {
            throw new Error("Missing u and v");
        }

        expr = math.compile(getExpr(equation.replace(/u/g, "x").replace(/v/g, "y")));
        try {
            for (let ix =  xStart; ix <= xEnd; ix = math.round(ix + space, 1)) {
                for (let iy =  yStart; iy <= yEnd; iy = math.round(iy + space, 1)) {
                    uvVals[[ix, iy].toString()] = math.round(expr.evaluate({x: ix, y: iy}), 5);
                }
            }
        } catch {
            for (let ix =  xStart; ix <=  xEnd; ix = math.round(ix + space, 1)) {
                for (let iy =  yStart; iy <=  yEnd; iy = math.round(iy + space, 1)) {
                    uvVals[[ix, iy].toString()] = math.round(expr.evaluate({x: ix, y: iy}), 5);
                }
            }
        }
    } else {
        if (equation.indexOf('x') == -1 && equation.indexOf('y') == -1) {
            throw new Error("Missing x and y");
        }

        expr = math.compile(getExpr(equation));
        try {
            for (let ix =  xStart; ix <=  xEnd; ix = math.round(ix +  space, 1)) {
                for (let iy =  yStart; iy <=  yEnd; iy = math.round(iy +  space, 1)) {
                    xyVals[[ix, iy].toString()] = math.round(expr.evaluate({x: ix, y: iy}), 5);
                }
            }
        } catch {
            for (let ix =  xStart; ix <=  xEnd; ix = math.round(ix +  space, 1)) {
                for (let iy =  yStart; iy <=  yEnd; iy = math.round(iy +  space, 1)) {
                    xyVals[[ix, iy].toString()] = math.round(expr.evaluate({x: ix, y: iy}), 5);
                }
            }
        }
    }
}

const getSecondVals = (xyVals, uvVals, equation, xTransform, yTransform, coordType) => {
    let expr;

    if (coordType == "uv") {
        if (equation.indexOf('u') == -1 && equation.indexOf('v') == -1) {
            throw new Error("Missing u and/or v");
        }

        expr = math.compile(getExpr(equation));
        try {
            for (let ix =  xStart; ix <=  xEnd; ix = math.round(ix +  space, 1)) {
                for (let iy =  yStart; iy <=  yEnd; iy = math.round(iy +  space, 1)) {
                    xyVals[[ix, iy].toString()] = math.round(expr.evaluate({u: ix, v: iy}), 5);
                }
            }
        } catch {
            for (let ix =  xStart; ix <=  xEnd; ix = math.round(ix +  space, 1)) {
                for (let iy =  yStart; iy <=  yEnd; iy = math.round(iy +  space, 1)) {
                    xyVals[[ix, iy].toString()] = math.round(expr.evaluate({u: ix, v: iy}), 5);
                }
            }
        }
    } else {
        if (equation.indexOf('x') == -1 && equation.indexOf('y') == -1) {
            throw new Error("Missing x and/or y");
        }

        expr = math.compile(
            getExpr(
                equation.replace(/(?<![a-zA-Z])x(?![a-zA-Z])/g, xTransform)
                .replace(/(?<![a-zA-Z])y(?![a-zA-Z])/g, yTransform)
            )
        );
        try {
            for (let ix =  xStart; ix <=  xEnd; ix = math.round(ix +  space, 1)) {
                for (let iy =  yStart; iy <=  yEnd; iy = math.round(iy +  space, 1)) {
                    uvVals[[ix, iy].toString()] = math.round(expr.evaluate({u: ix, v: iy}), 5);
                }
            }
        } catch {
            for (let ix =  xStart; ix <=  xEnd; ix = math.round(ix +  space, 1)) {
                for (let iy =  yStart; iy <=  yEnd; iy = math.round(iy +  space, 1)) {
                    uvVals[[ix, iy].toString()] = math.round(expr.evaluate({u: ix, v: iy}), 5);
                }
            }
        }
    }
}