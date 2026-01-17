const xStart = -10.0;
const xEnd = 10.0;
const yStart = -10.0;
const yEnd = 10.0;

const xyCanvas = $("#xy-graph")[0];
const uvCanvas = $("#uv-graph")[0];

var width = (xyCanvas.width = $(window).width() / 2 - 1);
var height = (xyCanvas.height = width);
uvCanvas.width = width;
uvCanvas.height = width;

const xTransform = $("#x-transformation")[0];
const yTransform = $("#y-transformation")[0];
const coordType = $("#coordinate-type")[0];
const equation = $("#equation")[0];

const notice = $("#notice")[0];
const helpBox = $("#help-box");
const helpText = $("#help-text")[0];

var xyVals = {};
var uvVals = {};
var uvToXY = {};

const helpBoxes = [introHelp, transformationHelp, equationHelp, graphHelp];
var currHelpIndex = 0;

// Initialize WebGL renderers
let xyRenderer, uvRenderer;
try {
    xyRenderer = new WebGLRenderer(xyCanvas);
    uvRenderer = new WebGLRenderer(uvCanvas);
    console.log('WebGL initialized successfully');
} catch (e) {
    console.error('WebGL initialization failed:', e);
    alert('WebGL not supported. Please use a modern browser with WebGL enabled.');
    throw e;
}

// Initialize curve tracer
const curveTracer = new CurveTracer(xStart, xEnd, yStart, yEnd, width, height);

const valueCalculator = new Worker("valueCalculator.js");
const transformationCalculator = new Worker("transformationCalculator.js");

const drawGraphs = () => {
    const startTime = performance.now();
    
    try {
        // Clear both canvases
        xyRenderer.clear();
        uvRenderer.clear();
        
        // Draw axes
        xyRenderer.drawAxes(xStart, xEnd, yStart, yEnd, width, height);
        uvRenderer.drawAxes(xStart, xEnd, yStart, yEnd, width, height);
        
        if (coordType.value == "xy") {
            // Trace curves in xy space
            const xySegments = curveTracer.traceContours(xyVals);
            xySegments.forEach(seg => {
                xyRenderer.addLineSegment(seg.x1, seg.y1, seg.x2, seg.y2);
            });
            xyRenderer.render([1.0, 0.0, 0.0, 1.0]); // Red
            
            // Trace curves in uv space
            const uvSegments = curveTracer.traceContours(uvVals);
            uvSegments.forEach(seg => {
                uvRenderer.addLineSegment(seg.x1, seg.y1, seg.x2, seg.y2);
            });
            uvRenderer.render([0.0, 0.0, 1.0, 1.0]); // Blue
        } else {
            // UV mode: trace in uv space
            const uvSegments = curveTracer.traceContours(uvVals);
            uvSegments.forEach(seg => {
                uvRenderer.addLineSegment(seg.x1, seg.y1, seg.x2, seg.y2);
            });
            uvRenderer.render([0.0, 0.0, 1.0, 1.0]); // Blue
            
            // Trace with transformation for xy space
            const transformFunc = (x, y) => {
                const key = [Math.round(x * 100) / 100, Math.round(y * 100) / 100].toString();
                const transformed = uvToXY[key];
                return transformed ? [transformed.x, transformed.y] : [x, y];
            };
            
            const xySegments = curveTracer.traceContours(xyVals, transformFunc);
            xySegments.forEach(seg => {
                xyRenderer.addLineSegment(seg.x1, seg.y1, seg.x2, seg.y2);
            });
            xyRenderer.render([1.0, 0.0, 0.0, 1.0]); // Red
        }
        
        const endTime = performance.now();
        console.log(`Rendered in ${(endTime - startTime).toFixed(1)}ms`);
    } catch (error) {
        // Silently ignore rendering errors
        console.log('Rendering error:', error.message);
    }
}

const triggerGraph = () => {
    notice.style.display = "block";

    const xTrans = xTransform.value.trim() || "u";
    const yTrans = yTransform.value.trim() || "v";

    valueCalculator.postMessage({
        xTransform: xTrans, 
        yTransform: yTrans, 
        equation: equation.value, 
        coordType: coordType.value
    });
};

$("#equation").on("input", e => {
    // Update on every keystroke
    if (equation.value.trim()) {
        triggerGraph();
    }
});

$("#equation").on("keydown", e => {
    if (e.key === "Enter" || e.keyCode == 13) {
        e.preventDefault();
        triggerGraph();
    }
});

$(".transformation").on("input", () => {
    const xTrans = xTransform.value.trim() || "u";
    const yTrans = yTransform.value.trim() || "v";
    
    transformationCalculator.postMessage({
        xTransform: xTrans,
        yTransform: yTrans
    });
    
    // Re-graph if we have an equation
    if (equation.value.trim()) {
        triggerGraph();
    }
});

$("#coordinate-type").on("change", () => {
    // Re-graph when coordinate type changes
    if (equation.value.trim()) {
        triggerGraph();
    }
});

$("#help").on("click", () => {
    currHelpIndex = 0;
    showHelpStep(0);
});

$("#next-help").on("click", () => {
    if (currHelpIndex == helpBoxes.length) {
        currHelpIndex = 0;
        helpBox[0].style.display = "none";
    } else {
        showHelpStep(currHelpIndex);
    }
});

function showHelpStep(index) {
    const step = helpBoxes[index];
    
    // Remove show class first
    helpBox.removeClass('show');
    
    // Expand menu if needed
    if (step.expandMenu && menu.classList.contains('collapsed')) {
        menu.classList.remove('collapsed');
    }
    
    // Position the help box first (before showing)
    if (step.attachTo) {
        // Attach to element
        const target = $(step.attachTo)[0];
        if (target) {
            const rect = target.getBoundingClientRect();
            const menuRect = menu.getBoundingClientRect();
            
            // Calculate position to the right of the menu
            let left = menuRect.right + 20;
            let top = rect.top;
            
            // Get help box dimensions (approximate)
            const helpBoxWidth = 384; // w-96 = 24rem = 384px
            const helpBoxHeight = 300; // approximate
            
            // Bound check
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            
            // If it would go off the right, position to the left of menu instead
            if (left + helpBoxWidth > windowWidth - 20) {
                left = menuRect.left - helpBoxWidth - 20;
            }
            
            // If still off screen on left, just position with margin from edge
            if (left < 20) {
                left = 20;
            }
            
            // Bound vertically
            if (top + helpBoxHeight > windowHeight - 20) {
                top = windowHeight - helpBoxHeight - 20;
            }
            if (top < 20) {
                top = 20;
            }
            
            helpBox.css("left", left + "px");
            helpBox.css("top", top + "px");
            helpBox.css("transform", "none");
            helpBox.css("margin", "0");
        }
    } else {
        // Use predefined position (centered)
        for (let i = 0; i < step.posCSS.length; ++i) {
            helpBox.css(step.posCSS[i][0], step.posCSS[i][1]);
        }
        
        // For centered positions, ensure they're still on screen
        setTimeout(() => {
            const helpBoxRect = helpBox[0].getBoundingClientRect();
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            
            let needsAdjustment = false;
            let newTop = null;
            
            // Check if off bottom
            if (helpBoxRect.bottom > windowHeight - 20) {
                newTop = windowHeight - helpBoxRect.height - 20;
                needsAdjustment = true;
            }
            
            // Check if off top
            if (helpBoxRect.top < 20) {
                newTop = 20;
                needsAdjustment = true;
            }
            
            if (needsAdjustment && newTop !== null) {
                helpBox.css("top", newTop + "px");
                helpBox.css("transform", "translateX(-50%)");
            }
        }, 0);
    }
    
    // Show and update content
    helpBox[0].style.display = "block";
    helpText.innerHTML = step.help;
    updateProgressDots();
    
    // Add show class after a tiny delay to trigger fade-in
    setTimeout(() => {
        helpBox.addClass('show');
    }, 10);
    
    ++currHelpIndex;
}

function updateProgressDots() {
    const dots = $("#help-box .flex.gap-2 .rounded-full");
    dots.each((index, dot) => {
        if (index === currHelpIndex) {
            $(dot).removeClass("bg-purple-300").addClass("bg-purple-600");
        } else {
            $(dot).removeClass("bg-purple-600").addClass("bg-purple-300");
        }
    });
    
    // Update button text
    if (currHelpIndex === helpBoxes.length - 1) {
        $("#next-help").html('Done <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>');
    } else {
        $("#next-help").html('Next <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>');
    }
};

valueCalculator.onmessage = msg => {
    notice.style.display = "none";

    if (!msg.data.e) {
        xyVals = {};
        uvVals = {};
        
        msg.data.xyVals.forEach(pair => {
            xyVals[pair[0]] = pair[1];
        });
        msg.data.uvVals.forEach(pair => {
            uvVals[pair[0]] = pair[1];
        });
        
        drawGraphs();
    } else {
        // Silently ignore errors - just don't update the graph
        console.log("Invalid equation:", msg.data.e);
    }
}

transformationCalculator.onmessage = msg => {
    if (msg.data.error) {
        console.error("Transformation error:", msg.data.error);
        return;
    }
    
    uvToXY = {};

    msg.data.uvToXY.forEach(pair => {
        uvToXY[pair[0]] = pair[1];
    });
}

// Initialize default transformations
xTransform.value = "u";
yTransform.value = "v";

// Initialize transformation calculator with defaults
transformationCalculator.postMessage({
    xTransform: "u",
    yTransform: "v"
});

// Draw initial axes
xyRenderer.drawAxes(xStart, xEnd, yStart, yEnd, width, height);
uvRenderer.drawAxes(xStart, xEnd, yStart, yEnd, width, height);

// Make menu draggable
let isDragging = false;
let currentX;
let currentY;
let initialX;
let initialY;
let xOffset = 0;
let yOffset = 0;

const menu = $("#menu")[0];
const menuHeader = $("#menu-header")[0];

menuHeader.addEventListener("mousedown", dragStart);
document.addEventListener("mousemove", drag);
document.addEventListener("mouseup", dragEnd);

function dragStart(e) {
    // Don't drag if clicking on buttons or inputs
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.closest('button')) {
        return;
    }
    
    // Get current position from transform or use 0
    const style = window.getComputedStyle(menu);
    const matrix = new DOMMatrixReadOnly(style.transform);
    xOffset = matrix.m41;
    yOffset = matrix.m42;
    
    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;
    
    if (e.target === menuHeader || menuHeader.contains(e.target)) {
        isDragging = true;
        menu.classList.add('dragging');
    }
}

function drag(e) {
    if (isDragging) {
        e.preventDefault();
        
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
        
        // Get the menu's current position WITHOUT the new transform
        // We need to temporarily remove transform to get base position
        const oldTransform = menu.style.transform;
        menu.style.transform = 'none';
        const baseRect = menu.getBoundingClientRect();
        menu.style.transform = oldTransform;
        
        // Calculate what the new position would be
        const newLeft = baseRect.left + currentX;
        const newRight = baseRect.right + currentX;
        const newTop = baseRect.top + currentY;
        const newBottom = baseRect.bottom + currentY;
        
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // Apply bounds (keep at least 100px visible)
        // Right edge: menu left must be less than windowWidth - 100
        if (newLeft > windowWidth - 100) {
            currentX = (windowWidth - 100) - baseRect.left;
        }
        
        // Left edge: menu right must be greater than 100
        if (newRight < 100) {
            currentX = 100 - baseRect.right;
        }
        
        // Bottom edge: menu top must be less than windowHeight - 100
        if (newTop > windowHeight - 100) {
            currentY = (windowHeight - 100) - baseRect.top;
        }
        
        // Top edge: menu top must be >= 0
        if (newTop < 0) {
            currentY = -baseRect.top;
        }
        
        xOffset = currentX;
        yOffset = currentY;
        
        setTranslate(currentX, currentY, menu);
    }
}

function dragEnd(e) {
    initialX = currentX;
    initialY = currentY;
    
    isDragging = false;
    menu.classList.remove('dragging');
}

function setTranslate(xPos, yPos, el) {
    el.style.transform = `translate(${xPos}px, ${yPos}px)`;
}

// Collapse/expand functionality
$("#collapse-toggle").on("click", () => {
    menu.classList.toggle('collapsed');
});
