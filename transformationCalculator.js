if ("function" === typeof(importScripts)) {
    importScripts("https://cdn.jsdelivr.net/npm/mathjs@12.3.2/lib/browser/math.min.js");
}

const xStart = -10.0;
const xEnd = 10.0;
const yStart = -10.0;
const yEnd = 10.0;
const space = 0.1;

self.onmessage = (msg) => {
    const xTransform = math.compile(msg.data.xTransform);
    const yTransform = math.compile(msg.data.yTransform);

    const uvToXY = new Map();

    for (let ix = xStart; ix <= xEnd; ix = math.round(ix + space, 1)) {
        for (let iy = yStart; iy <= yEnd; iy = math.round(iy + space, 1)) {
            uvToXY[[ix, iy].toString()] = {
                x: xTransform.evaluate({u: ix, v: iy}), 
                y: yTransform.evaluate({u: ix, v: iy})
            };
        }
    }

    self.postMessage({
        uvToXY: Object.entries(uvToXY)
    });
}