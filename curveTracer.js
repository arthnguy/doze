class CurveTracer {
    constructor(xStart, xEnd, yStart, yEnd, width, height) {
        this.xStart = xStart;
        this.xEnd = xEnd;
        this.yStart = yStart;
        this.yEnd = yEnd;
        this.width = width;
        this.height = height;
        this.resolution = 0.1;
    }

    graphToCanvas(x, y) {
        return {
            x: ((x - this.xStart) / (this.xEnd - this.xStart)) * this.width,
            y: ((-y - this.yStart) / (this.yEnd - this.yStart)) * this.height
        };
    }

    makeKey(x, y) {
        const roundedX = Math.round(x * 100) / 100;
        const roundedY = Math.round(y * 100) / 100;
        return [roundedX, roundedY].toString();
    }

    traceContours(coordVals, transformFunc = null) {
        const segments = [];
        const step = this.resolution;
        
        for (let x = this.xStart; x < this.xEnd; x = Math.round((x + step) * 100) / 100) {
            for (let y = this.yStart; y < this.yEnd; y = Math.round((y + step) * 100) / 100) {
                const xNext = Math.round((x + step) * 100) / 100;
                const yNext = Math.round((y + step) * 100) / 100;
                
                const cellSegments = this.traceCell(
                    x, y, xNext, yNext, 
                    coordVals, 
                    transformFunc
                );
                
                if (cellSegments) {
                    segments.push(...cellSegments);
                }
            }
        }
        
        return segments;
    }

    traceCell(x1, y1, x2, y2, coordVals, transformFunc) {
        const tl = coordVals[this.makeKey(x1, y1)];
        const tr = coordVals[this.makeKey(x2, y1)];
        const bl = coordVals[this.makeKey(x1, y2)];
        const br = coordVals[this.makeKey(x2, y2)];

        if (tl === undefined || tr === undefined || bl === undefined || br === undefined) {
            return null;
        }

        // No crossing
        if ((tl > 0 && tr > 0 && bl > 0 && br > 0) ||
            (tl < 0 && tr < 0 && bl < 0 && br < 0)) {
            return null;
        }

        // Get canvas coordinates
        let tlCanvas, trCanvas, blCanvas, brCanvas;
        
        if (transformFunc) {
            tlCanvas = this.graphToCanvas(...transformFunc(x1, y1));
            trCanvas = this.graphToCanvas(...transformFunc(x2, y1));
            blCanvas = this.graphToCanvas(...transformFunc(x1, y2));
            brCanvas = this.graphToCanvas(...transformFunc(x2, y2));
        } else {
            tlCanvas = this.graphToCanvas(x1, y1);
            trCanvas = this.graphToCanvas(x2, y1);
            blCanvas = this.graphToCanvas(x1, y2);
            brCanvas = this.graphToCanvas(x2, y2);
        }

        return this.getCellSegments(tlCanvas, trCanvas, blCanvas, brCanvas, tl, tr, bl, br);
    }

    lerp(a, b, v0, v1) {
        const t = v0 / (v0 - v1);
        return {
            x: a.x + t * (b.x - a.x),
            y: a.y + t * (b.y - a.y)
        };
    }

    getCellSegments(tlCanvas, trCanvas, blCanvas, brCanvas, tl, tr, bl, br) {
        const segments = [];
        let start, end;
        
        if (tl > 0 && tr < 0 && bl < 0 && br < 0 || 
            tl < 0 && tr > 0 && bl > 0 && br > 0) {
            start = this.lerp(tlCanvas, trCanvas, tl, tr);
            end = this.lerp(tlCanvas, blCanvas, tl, bl);
        } else if (tl < 0 && tr > 0 && bl < 0 && br < 0 || 
                   tl > 0 && tr < 0 && bl > 0 && br > 0) {
            start = this.lerp(tlCanvas, trCanvas, tl, tr);
            end = this.lerp(trCanvas, brCanvas, tr, br);
        } else if (tl < 0 && tr < 0 && bl < 0 && br > 0 || 
                   tl > 0 && tr > 0 && bl > 0 && br < 0) {
            start = this.lerp(trCanvas, brCanvas, tr, br);
            end = this.lerp(blCanvas, brCanvas, bl, br);
        } else if (tl < 0 && tr < 0 && bl > 0 && br < 0 || 
                   tl > 0 && tr > 0 && bl < 0 && br > 0) {
            start = this.lerp(blCanvas, brCanvas, bl, br);
            end = this.lerp(tlCanvas, blCanvas, tl, bl);
        } else if (tl > 0 && tr < 0 && bl > 0 && br < 0 || 
                   tl < 0 && tr > 0 && bl < 0 && br > 0) {
            start = this.lerp(tlCanvas, trCanvas, tl, tr);
            end = this.lerp(blCanvas, brCanvas, bl, br);
        } else if (tl > 0 && tr > 0 && bl < 0 && br < 0 || 
                   tl < 0 && tr < 0 && bl > 0 && br > 0) {
            start = this.lerp(tlCanvas, blCanvas, tl, bl);
            end = this.lerp(trCanvas, brCanvas, tr, br);
        } else if (tl > 0 && tr < 0 && bl < 0 && br > 0) {
            const seg1Start = this.lerp(tlCanvas, trCanvas, tl, tr);
            const seg1End = this.lerp(trCanvas, brCanvas, tr, br);
            segments.push({
                x1: seg1Start.x, y1: seg1Start.y,
                x2: seg1End.x, y2: seg1End.y
            });
            start = this.lerp(blCanvas, brCanvas, bl, br);
            end = this.lerp(tlCanvas, blCanvas, tl, bl);
        } else if (tl < 0 && tr > 0 && bl > 0 && br < 0) {
            const seg1Start = this.lerp(tlCanvas, trCanvas, tl, tr);
            const seg1End = this.lerp(tlCanvas, blCanvas, tl, bl);
            segments.push({
                x1: seg1Start.x, y1: seg1Start.y,
                x2: seg1End.x, y2: seg1End.y
            });
            start = this.lerp(trCanvas, brCanvas, tr, br);
            end = this.lerp(blCanvas, brCanvas, bl, br);
        } else if (tl > 0 && tr == 0 && bl < 0 && br < 0 || 
                   tl < 0 && tr == 0 && bl > 0 && br > 0) {
            start = trCanvas;
            end = this.lerp(tlCanvas, blCanvas, tl, bl);
        } else if (tl < 0 && tr == 0 && bl < 0 && br > 0 || 
                   tl > 0 && tr == 0 && bl > 0 && br < 0) {
            start = trCanvas;
            end = this.lerp(blCanvas, brCanvas, bl, br);
        } else if (tl == 0 && tr > 0 && bl < 0 && br < 0 || 
                   tl == 0 && tr < 0 && bl > 0 && br > 0) {
            start = tlCanvas;
            end = this.lerp(trCanvas, brCanvas, tr, br);
        } else if (tl == 0 && tr < 0 && bl > 0 && br < 0 || 
                   tl == 0 && tr > 0 && bl < 0 && br > 0) {
            start = tlCanvas;
            end = this.lerp(blCanvas, brCanvas, bl, br);
        } else if (tl > 0 && tr < 0 && bl == 0 && br < 0 || 
                   tl < 0 && tr > 0 && bl == 0 && br > 0) {
            start = blCanvas;
            end = this.lerp(tlCanvas, trCanvas, tl, tr);
        } else if (tl < 0 && tr < 0 && bl == 0 && br > 0 ||
                   tl > 0 && tr > 0 && bl == 0 && br < 0) {
            start = blCanvas;
            end = this.lerp(trCanvas, brCanvas, tr, br);
        } else if (tl < 0 && tr > 0 && bl < 0 && br == 0 || 
                   tl > 0 && tr < 0 && bl > 0 && br == 0) {
            start = brCanvas;
            end = this.lerp(tlCanvas, trCanvas, tl, tr);
        } else if (tl < 0 && tr < 0 && bl > 0 && br == 0 || 
                   tl > 0 && tr > 0 && bl < 0 && br == 0) {
            start = brCanvas;
            end = this.lerp(tlCanvas, blCanvas, tl, bl);
        } else if (tl == 0 && tr == 0 && bl != 0 && br != 0) {
            start = tlCanvas;
            end = trCanvas;
        } else if (bl == 0 && tl == 0 && br != 0 && tr != 0) {
            start = tlCanvas;
            end = blCanvas;
        } else if (tl == 0 && br == 0 && tr != 0 && bl != 0) {
            start = tlCanvas;
            end = brCanvas;
        } else if (bl == 0 && tr == 0 && tl != 0 && br != 0) {
            start = blCanvas;
            end = trCanvas;
        } else {
            return null;
        }
        
        if (start && end) {
            segments.push({x1: start.x, y1: start.y, x2: end.x, y2: end.y});
        }
        
        return segments.length > 0 ? segments : null;
    }
}
