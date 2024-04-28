if("function" === typeof(importScripts)) {
    importScripts("https://cdn.jsdelivr.net/npm/mathjs@12.3.2/lib/browser/math.min.js");
}

const xStart = -10.0;
const xEnd = 10.0;
const yStart = -10.0;
const yEnd = 10.0;
const space = 0.2;

onmessage = (msg) => {
    xStart = msg.data.xStart;
    xTransform = msg.data.xTransform;
    yTransform = msg.data.yTransform;
    coordType = msg.data.coordType;
    xyVals = msg.data.xyVals;
    uvVals = msg.data.uvVals;

    drawGraphs();
}

const lerp = (a, b, v0, v1) => {
    return {
        x: math.subtract(a.x, math.divide(math.multiply(v0, math.subtract(b.x, a.x)), math.subtract(v1, v0))),
        y: math.subtract(a.y, math.divide(math.multiply(v0, math.subtract(b.y, a.y)), math.subtract(v1, v0)))
    };
}

const graphToCanvasSpace = (point) => {
    return {
        x: math.number(math.multiply(math.divide(math.subtract(point.x, xStart), math.subtract(xEnd, xStart)), math.bignumber(width))), 
        y: math.number(math.multiply(math.divide(math.subtract(math.bignumber(-point.y), yStart), math.subtract(yEnd, yStart)), math.bignumber(height)))
    };
}

const handleSection = (ctx, tlPoint, trPoint, blPoint, brPoint, tl, tr, bl, br) => {
    if (tl.im || tr.im || bl.im || br.im) {
        return;
    }

    let start, end;
    
    if (
        math.larger(tl, 0) && math.larger(tr, 0) && math.larger(bl, 0) && math.larger(br, 0) ||
        math.smaller(tl, 0) && math.smaller(tr, 0) && math.smaller(bl, 0) && math.smaller(br, 0)
    ) {
        return;
    }
    else if (
        math.larger(tl, 0) && math.smaller(tr, 0) && math.smaller(bl, 0) && math.smaller(br, 0) || 
        math.smaller(tl, 0) && math.larger(tr, 0) && math.larger(bl, 0) && math.larger(br, 0)
    ) { // top /
        start = graphToCanvasSpace(lerp(tlPoint, trPoint, tl, tr));
        end = graphToCanvasSpace(lerp(tlPoint, blPoint, tl, bl));
    } else if (
        math.smaller(tl, 0) && math.larger(tr, 0) && math.smaller(bl, 0) && math.smaller(br, 0) || 
        math.larger(tl, 0) && math.smaller(tr, 0) && math.larger(bl, 0) && math.larger(br, 0)
    ) { // top \
        start = graphToCanvasSpace(lerp(tlPoint, trPoint, tl, tr));
        end = graphToCanvasSpace(lerp(trPoint, brPoint, tr, br));
    } else if (
        math.smaller(tl, 0) && math.smaller(tr, 0) && math.smaller(bl, 0) && math.larger(br, 0) || 
        math.larger(tl, 0) && math.larger(tr, 0) && math.larger(bl, 0) && math.smaller(br, 0)
    ) { // bottom /
        start = graphToCanvasSpace(lerp(trPoint, brPoint, tr, br));
        end = graphToCanvasSpace(lerp(blPoint, brPoint, bl, br));
    } else if (
        math.smaller(tl, 0) && math.smaller(tr, 0) && math.larger(bl, 0) && math.smaller(br, 0) || 
        math.larger(tl, 0) && math.larger(tr, 0) && math.smaller(bl, 0) && math.larger(br, 0)
    ) { // bottom \
        start = graphToCanvasSpace(lerp(blPoint, brPoint, bl, br));
        end = graphToCanvasSpace(lerp(tlPoint, blPoint, tl, bl));
    } else if (
        math.larger(tl, 0) && math.smaller(tr, 0) && math.larger(bl, 0) && math.smaller(br, 0) || 
        math.smaller(tl, 0) && math.larger(tr, 0) && math.smaller(bl, 0) && math.larger(br, 0)
    ) { // |
        start = graphToCanvasSpace(lerp(tlPoint, trPoint, tl, tr));
        end = graphToCanvasSpace(lerp(blPoint, brPoint, bl, br));
    } else if (
        math.larger(tl, 0) && math.larger(tr, 0) && math.smaller(bl, 0) && math.smaller(br, 0) || 
        math.smaller(tl, 0) && math.smaller(tr, 0) && math.larger(bl, 0) && math.larger(br, 0)
    ) { // -
        start = graphToCanvasSpace(lerp(tlPoint, blPoint, tl, bl));
        end = graphToCanvasSpace(lerp(trPoint, brPoint, tr, br));
    } else if (math.larger(tl, 0) && math.smaller(tr, 0) && math.smaller(bl, 0) && math.larger(br, 0)) { // \ \
        start = graphToCanvasSpace(lerp(tlPoint, trPoint, tl, tr));
        end = graphToCanvasSpace(lerp(trPoint, brPoint, tr, br));

        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);

        start = graphToCanvasSpace(lerp(blPoint, brPoint, bl, br));
        end = graphToCanvasSpace(lerp(tlPoint, blPoint, tl, bl));
    } else if (math.smaller(tl, 0) && math.larger(tr, 0) && math.larger(bl, 0) && math.smaller(br, 0)) { // / /
        start = graphToCanvasSpace(lerp(tlPoint, trPoint, tl, tr));
        end = graphToCanvasSpace(lerp(tlPoint, blPoint, tl, bl));

        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);

        start = graphToCanvasSpace(lerp(trPoint, brPoint, tr, br));
        end = graphToCanvasSpace(lerp(blPoint, brPoint, bl, br));
    } else if (
        math.larger(tl, 0) && math.equal(tr, 0) && math.smaller(bl, 0) && math.smaller(br, 0) || 
        math.smaller(tl, 0) && math.equal(tr, 0) && math.larger(bl, 0) && math.larger(br, 0)
    ) { // tr /
        start = graphToCanvasSpace(trPoint);
        end = graphToCanvasSpace(lerp(tlPoint, blPoint, tl, bl));
    } else if (
        math.smaller(tl, 0) && math.equal(tr, 0) && math.smaller(bl, 0) && math.larger(br, 0) || 
        math.larger(tl, 0) && math.equal(tr, 0) && math.larger(bl, 0) && math.smaller(br, 0)
    ) {
        start = graphToCanvasSpace(trPoint);
        end = graphToCanvasSpace(lerp(blPoint, brPoint, bl, br));
    } else if (
        math.equal(tl, 0) && math.larger(tr, 0) && math.smaller(bl, 0) && math.smaller(br, 0) || 
        math.equal(tl, 0) && math.smaller(tr, 0) && math.larger(bl, 0) && math.larger(br, 0)
    ) { // tl \
        start = graphToCanvasSpace(tlPoint);
        end = graphToCanvasSpace(lerp(trPoint, brPoint, tr, br));
    } else if (
        math.equal(tl, 0) && math.smaller(tr, 0) && math.larger(bl, 0) && math.smaller(br, 0) || 
        math.equal(tl, 0) && math.larger(tr, 0) && math.smaller(bl, 0) && math.larger(br, 0)
    ) {
        start = graphToCanvasSpace(tlPoint);
        end = graphToCanvasSpace(lerp(blPoint, brPoint, bl, br));
    } else if (
        math.larger(tl, 0) && math.smaller(tr, 0) && math.equal(bl, 0) && math.smaller(br, 0) || 
        math.smaller(tl, 0) && math.larger(tr, 0) && math.equal(bl, 0) && math.larger(br, 0)
    ) { // bl /
        start = graphToCanvasSpace(blPoint);
        end = graphToCanvasSpace(lerp(tlPoint, trPoint, tl, tr));
    } else if (
        math.smaller(tl, 0) && math.smaller(tr, 0) && math.equal(bl, 0) && math.larger(br, 0) || 
        math.larger(tl, 0) && math.larger(tr, 0) && math.equal(bl, 0) && math.smaller(br, 0)
    ) {
        start = graphToCanvasSpace(blPoint);
        end = graphToCanvasSpace(lerp(trPoint, brPoint, tr, br));
    } else if (
        math.smaller(tl, 0) && math.larger(tr, 0) && math.smaller(bl, 0) && math.equal(br, 0) || 
        math.larger(tl, 0) && math.smaller(tr, 0) && math.larger(bl, 0) && math.equal(br, 0)
    ) { // br \
        start = graphToCanvasSpace(brPoint);
        end = graphToCanvasSpace(lerp(tlPoint, trPoint, tl, tr));
    } else if (
        math.smaller(tl, 0) && math.smaller(tr, 0) && math.larger(bl, 0) && math.equal(br, 0) || 
        math.larger(tl, 0) && math.larger(tr, 0) && math.smaller(bl, 0) && math.equal(br, 0)
    ) {
        start = graphToCanvasSpace(brPoint);
        end = graphToCanvasSpace(lerp(tlPoint, blPoint, tl, bl));
    } else if (math.equal(tl, 0) && math.equal(tr, 0) && math.unequal(bl, 0) && math.unequal(br, 0)) {
        start = graphToCanvasSpace(tlPoint);
        end = graphToCanvasSpace(trPoint);
    } else if (math.equal(bl, 0) && math.equal(tl, 0) && math.unequal(br, 0) && math.unequal(tr, 0)) {
        start = graphToCanvasSpace(tlPoint);
        end = graphToCanvasSpace(blPoint);
    } else if (math.equal(tl, 0) && math.equal(br, 0) && math.unequal(tr, 0) && math.unequal(bl, 0)) {
        start = graphToCanvasSpace(tlPoint);
        end = graphToCanvasSpace(brPoint);
    } else if (math.equal(bl, 0) && math.equal(tr, 0) && math.unequal(tl, 0) && math.unequal(br, 0)) {
        start = graphToCanvasSpace(blPoint);
        end = graphToCanvasSpace(trPoint);
    } else {
        return;
    }

    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
}

const drawFunction = (ctx, color, coordVals) => {
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.strokeStyle = color;

    for (let ix = xStart; math.smaller(ix, xEnd); ix = math.add(ix, space)) {
        for (let iy = yEnd; math.larger(iy, yStart); iy = math.subtract(iy, space)) {
            handleSection(
                ctx, 
                {x: ix, y: iy},
                {x: math.add(ix, space), y: iy},
                {x: ix, y: math.subtract(iy, space)},
                {x: math.add(ix, space), y: math.subtract(iy, space)},
                coordVals[[ix, iy].toString()],
                coordVals[[math.add(ix, space), iy].toString()],
                coordVals[[ix, math.subtract(iy, space)].toString()],
                coordVals[[math.add(ix, space), math.subtract(iy, space)].toString()]
            );
        }
    }

    ctx.stroke();
}

const drawFunctionFromUV = (ctx, color, coordVals) => {
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.strokeStyle = color;

    for (let ix = xStart; math.smaller(ix, xEnd); ix = math.add(ix, space)) {
        for (let iy = yEnd; math.larger(iy, yStart); iy = math.subtract(iy, space)) {
            handleSection(
                ctx, 
                uvToXY[[ix, iy].toString()],
                uvToXY[[math.add(ix, space), iy].toString()],
                uvToXY[[ix, math.subtract(iy, space)].toString()],
                uvToXY[[math.add(ix, space), math.subtract(iy, space)].toString()],
                coordVals[[ix, iy].toString()],
                coordVals[[math.add(ix, space), iy].toString()],
                coordVals[[ix, math.subtract(iy, space)].toString()],
                coordVals[[math.add(ix, space), math.subtract(iy, space)].toString()]
            );
        }
    }

    ctx.stroke();
}

const drawAxes = (ctx) => {
    xyCtx.lineWidth = 1;
    uvCtx.lineWidth = 1;

    ctx.beginPath();
    ctx.strokeStyle = "black";

    ctx.moveTo(...Object.values(graphToCanvasSpace({x: xStart, y: 0})));
    ctx.lineTo(...Object.values(graphToCanvasSpace({x: xEnd, y: 0})));
    ctx.moveTo(...Object.values(graphToCanvasSpace({x: 0, y: yStart})));
    ctx.lineTo(...Object.values(graphToCanvasSpace({x: 0, y: yEnd})));

    ctx.stroke();
}

const drawGraphs = () => {
    xyCtx.clearRect(0, 0, 2000, 2000);
    uvCtx.clearRect(0, 0, 2000, 2000);
    drawAxes(xyCtx);
    drawAxes(uvCtx);

    if (coordType.value == "xy") {
        drawFunction(xyCtx, "red", xyVals);
        drawFunction(uvCtx, "blue", uvVals);
    } else {
        drawFunction(uvCtx, "blue", uvVals);
        drawFunctionFromUV(xyCtx, "red", xyVals);
    }
}