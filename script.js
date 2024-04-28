const xStart = -10.0;
const xEnd = 10.0;
const yStart = -10.0;
const yEnd = 10.0;
const space = 0.1;

const xyCtx = $("#xy-graph")[0].getContext("2d");
const uvCtx = $("#uv-graph")[0].getContext("2d");

var width = ($("#xy-graph")[0].width = $(window).width() / 2 - 1);
var height = ($("#xy-graph")[0].height = width);
$("#uv-graph")[0].width = width;
$("#uv-graph")[0].height = width;

const xTransform = $("#x-transformation")[0];
const yTransform = $("#y-transformation")[0];
const coordType = $("#coordinate-type")[0];
const equation = $("#equation")[0];

const notice = $("#notice")[0];

var xyVals = new Map();
var uvVals = new Map();
var uvToXY = new Map();

const valueCalculator = new Worker("valueCalculator.js");
const transformationCalculator = new Worker("transformationCalculator.js");

const lerp = (a, b, v0, v1) => {
    return {
        x: a.x - ((v0 * (b.x - a.x)) / (v1 - v0)),
        y: a.y - ((v0 * (b.y - a.y)) / (v1 - v0))
    };
}

const graphToCanvasSpace = (point) => {
    return {
        x: ((point.x - xStart) / (xEnd - xStart)) * width,
        y: ((-point.y - yStart) / (yEnd - yStart)) * height
    };
}

const handleSection = (ctx, tlPoint, trPoint, blPoint, brPoint, tl, tr, bl, br) => {
    let start, end;
    
    if (
        tl > 0 && tr > 0 && bl > 0 && br > 0 ||
        tl < 0 && tr < 0 && bl < 0 && br < 0
    ) {
        return;
    }
    else if (
        tl > 0 && tr < 0 && bl < 0 && br < 0 || 
        tl < 0 && tr > 0 && bl > 0 && br > 0
    ) { // top /
        start = graphToCanvasSpace(lerp(tlPoint, trPoint, tl, tr));
        end = graphToCanvasSpace(lerp(tlPoint, blPoint, tl, bl));
    } else if (
        tl < 0 && tr > 0 && bl < 0 && br < 0 || 
        tl > 0 && tr < 0 && bl > 0 && br > 0
    ) { // top \
        start = graphToCanvasSpace(lerp(tlPoint, trPoint, tl, tr));
        end = graphToCanvasSpace(lerp(trPoint, brPoint, tr, br));
    } else if (
        tl < 0 && tr < 0 && bl < 0 && br > 0 || 
        tl > 0 && tr > 0 && bl > 0 && br < 0
    ) { // bottom /
        start = graphToCanvasSpace(lerp(trPoint, brPoint, tr, br));
        end = graphToCanvasSpace(lerp(blPoint, brPoint, bl, br));
    } else if (
        tl < 0 && tr < 0 && bl > 0 && br < 0 || 
        tl > 0 && tr > 0 && bl < 0 && br > 0
    ) { // bottom \
        start = graphToCanvasSpace(lerp(blPoint, brPoint, bl, br));
        end = graphToCanvasSpace(lerp(tlPoint, blPoint, tl, bl));
    } else if (
        tl > 0 && tr < 0 && bl > 0 && br < 0 || 
        tl < 0 && tr > 0 && bl < 0 && br > 0
    ) { // |
        start = graphToCanvasSpace(lerp(tlPoint, trPoint, tl, tr));
        end = graphToCanvasSpace(lerp(blPoint, brPoint, bl, br));
    } else if (
        tl > 0 && tr > 0 && bl < 0 && br < 0 || 
        tl < 0 && tr < 0 && bl > 0 && br > 0
    ) { // -
        start = graphToCanvasSpace(lerp(tlPoint, blPoint, tl, bl));
        end = graphToCanvasSpace(lerp(trPoint, brPoint, tr, br));
    } else if (tl > 0 && tr < 0 && bl < 0 && br > 0) { // \ \
        start = graphToCanvasSpace(lerp(tlPoint, trPoint, tl, tr));
        end = graphToCanvasSpace(lerp(trPoint, brPoint, tr, br));

        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);

        start = graphToCanvasSpace(lerp(blPoint, brPoint, bl, br));
        end = graphToCanvasSpace(lerp(tlPoint, blPoint, tl, bl));
    } else if (tl < 0 && tr > 0 && bl > 0 && br < 0) { // / /
        start = graphToCanvasSpace(lerp(tlPoint, trPoint, tl, tr));
        end = graphToCanvasSpace(lerp(tlPoint, blPoint, tl, bl));

        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);

        start = graphToCanvasSpace(lerp(trPoint, brPoint, tr, br));
        end = graphToCanvasSpace(lerp(blPoint, brPoint, bl, br));
    } else if (
        tl > 0 && tr == 0 && bl < 0 && br < 0 || 
        tl < 0 && tr == 0 && bl > 0 && br > 0
    ) { // tr /
        start = graphToCanvasSpace(trPoint);
        end = graphToCanvasSpace(lerp(tlPoint, blPoint, tl, bl));
    } else if (
        tl < 0 && tr == 0 && bl < 0 && br > 0 || 
        tl > 0 && tr == 0 && bl > 0 && br < 0
    ) {
        start = graphToCanvasSpace(trPoint);
        end = graphToCanvasSpace(lerp(blPoint, brPoint, bl, br));
    } else if (
        tl == 0 && tr > 0 && bl < 0 && br < 0 || 
        tl == 0 && tr < 0 && bl > 0 && br > 0
    ) { // tl \
        start = graphToCanvasSpace(tlPoint);
        end = graphToCanvasSpace(lerp(trPoint, brPoint, tr, br));
    } else if (
        tl == 0 && tr < 0 && bl > 0 && br < 0 || 
        tl == 0 && tr > 0 && bl < 0 && br > 0
    ) {
        start = graphToCanvasSpace(tlPoint);
        end = graphToCanvasSpace(lerp(blPoint, brPoint, bl, br));
    } else if (
        tl > 0 && tr < 0 && bl == 0 && br < 0 || 
        tl < 0 && tr > 0 && bl == 0 && br > 0
    ) { // bl /
        start = graphToCanvasSpace(blPoint);
        end = graphToCanvasSpace(lerp(tlPoint, trPoint, tl, tr));
    } else if (
        tl < 0 && tr < 0 && bl == 0 && br > 0 ||
        tl > 0 && tr > 0 && bl == 0 && br < 0
    ) {
        start = graphToCanvasSpace(blPoint);
        end = graphToCanvasSpace(lerp(trPoint, brPoint, tr, br));
    } else if (
        tl < 0 && tr > 0 && bl < 0 && br == 0 || 
        tl > 0 && tr < 0 && bl > 0 && br == 0
    ) { // br \
        start = graphToCanvasSpace(brPoint);
        end = graphToCanvasSpace(lerp(tlPoint, trPoint, tl, tr));
    } else if (
        tl < 0 && tr < 0 && bl > 0 && br == 0 || 
        tl > 0 && tr > 0 && bl < 0 && br == 0
    ) {
        start = graphToCanvasSpace(brPoint);
        end = graphToCanvasSpace(lerp(tlPoint, blPoint, tl, bl));
    } else if (tl == 0 && tr == 0 && bl != 0 && br != 0) {
        start = graphToCanvasSpace(tlPoint);
        end = graphToCanvasSpace(trPoint);
    } else if (bl == 0 && tl == 0 && br != 0 && tr != 0) {
        start = graphToCanvasSpace(tlPoint);
        end = graphToCanvasSpace(blPoint);
    } else if (tl == 0 && br == 0 && tr != 0 && bl != 0) {
        start = graphToCanvasSpace(tlPoint);
        end = graphToCanvasSpace(brPoint);
    } else if (bl == 0 && tr == 0 && tl != 0 && br != 0) {
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

    for (let ix = xStart; ix < xEnd; ix = math.round(ix + space, 1)) {
        for (let iy = yEnd; iy > yStart; iy = math.round(iy - space, 1)) {
            handleSection(
                ctx, 
                {x: ix, y: iy},
                {x: math.round(ix + space, 1), y: iy},
                {x: ix, y: math.round(iy - space, 1)},
                {x: math.round(ix + space, 1), y: math.round(iy - space, 1)},
                coordVals[[ix, iy].toString()],
                coordVals[[math.round(ix + space, 1), iy].toString()],
                coordVals[[ix, math.round(iy - space, 1)].toString()],
                coordVals[[math.round(ix + space, 1), math.round(iy - space, 1)].toString()]
            );
        }
    }

    ctx.stroke();
}

const drawFunctionFromUV = (ctx, color, coordVals) => {
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.strokeStyle = color;

    for (let ix = xStart; ix < xEnd; ix = math.round(ix + space, 1)) {
        for (let iy = yEnd; iy > yStart; iy = math.round(iy - space, 1)) {
            handleSection(
                ctx, 
                uvToXY[[ix, iy].toString()],
                uvToXY[[math.round(ix + space, 1), iy].toString()],
                uvToXY[[ix, math.round(iy - space, 1)].toString()],
                uvToXY[[math.round(ix + space, 1), math.round(iy - space, 1)].toString()],
                coordVals[[ix, iy].toString()],
                coordVals[[math.round(ix + space, 1), iy].toString()],
                coordVals[[ix, math.round(iy - space, 1)].toString()],
                coordVals[[math.round(ix + space, 1), math.round(iy - space, 1)].toString()]
            );
        }
    }

    ctx.stroke();
}

const drawAxes = (ctx) => {
    ctx.lineWidth = 1;

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

$("#equation").on("keydown", e => {
    if (e.keyCode == 13) { // enter
        notice.style.display = "block";

        valueCalculator.postMessage({
            xTransform: xTransform.value, 
            yTransform: yTransform.value, 
            equation: equation.value, 
            coordType: coordType.value
        });
    }
});

$(".transformation").on("focusout", () => {
    try {
        transformationCalculator.postMessage({
            xTransform: xTransform.value,
            yTransform: yTransform.value
        });
    } catch {
        console.log("incomplete transformations definitions");
    }
});

valueCalculator.onmessage = msg => {
    notice.style.display = "none";

    if (!msg.data.e) {
        xyVals = new Map();
        uvVals = new Map();
        
        msg.data.xyVals.forEach(pair => {
            xyVals[pair[0]] = pair[1];
        });
        msg.data.uvVals.forEach(pair => {
            uvVals[pair[0]] = pair[1];
        })
        
        drawGraphs();
    } else {
        console.log(msg.data.e)
    }
}

transformationCalculator.onmessage = msg => {
    uvToXY = new Map();

    msg.data.uvToXY.forEach(pair => {
        uvToXY[pair[0]] = pair[1];
    });
}

drawAxes(xyCtx);
drawAxes(uvCtx);