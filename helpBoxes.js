const introHelp = {
    help: `
        <div class="space-y-3">
            <h3 class="font-bold text-lg text-purple-700">Welcome to DOZE!</h3>
            <p class="text-gray-700">A live graphing calculator for exploring coordinate transformations.</p>
            <div class="bg-purple-50 p-3 rounded-lg">
                <p class="text-sm text-gray-600"><strong>Tip:</strong> Graphs update instantly as you type!</p>
            </div>
        </div>
    `,
    posCSS: [["left", "50%"], ["top", "30%"], ["transform", "translate(-50%, 0)"], ["margin", "0"]],
    expandMenu: false,
    attachTo: null,
};

const transformationHelp = {
    help: `
        <div class="space-y-3">
            <h3 class="font-bold text-lg text-purple-700">Transformations</h3>
            <p class="text-gray-700">Define how <span class="font-mono bg-gray-100 px-1 rounded">u,v</span> coordinates map to <span class="font-mono bg-gray-100 px-1 rounded">x,y</span>.</p>
            <div class="bg-blue-50 p-3 rounded-lg space-y-2">
                <p class="text-sm font-semibold text-gray-700">Examples:</p>
                <p class="text-sm text-gray-600">x = 2*u, y = v (stretch)</p>
                <p class="text-sm text-gray-600">x = u*cos(1), y = u*sin(1) (rotate)</p>
            </div>
        </div>
    `,
    posCSS: [],
    expandMenu: true,
    attachTo: "#x-transformation",
};

const equationHelp = {
    help: `
        <div class="space-y-3">
            <h3 class="font-bold text-lg text-purple-700">Equation Input</h3>
            <p class="text-gray-700">Enter any implicit equation. Choose <span class="font-mono bg-gray-100 px-1 rounded">xy</span> or <span class="font-mono bg-gray-100 px-1 rounded">uv</span> mode.</p>
            <div class="bg-green-50 p-3 rounded-lg space-y-2">
                <p class="text-sm font-semibold text-gray-700">Try these:</p>
                <p class="text-sm text-gray-600">x^2 + y^2 = 25 (circle)</p>
                <p class="text-sm text-gray-600">sin(x) + cos(y) = 0 (waves)</p>
                <p class="text-sm text-gray-600">x^2 - y^2 = 1 (hyperbola)</p>
            </div>
        </div>
    `,
    posCSS: [],
    expandMenu: true,
    attachTo: "#equation",
};

const graphHelp = {
    help: `
        <div class="space-y-3">
            <h3 class="font-bold text-lg text-purple-700">The Graphs</h3>
            <p class="text-gray-700">See your equation in both coordinate systems simultaneously.</p>
            <div class="grid grid-cols-2 gap-2 mt-2">
                <div class="bg-red-50 p-2 rounded-lg">
                    <p class="text-sm font-semibold text-red-700">Left: xy-plane</p>
                    <p class="text-xs text-gray-600">Standard coordinates</p>
                </div>
                <div class="bg-blue-50 p-2 rounded-lg">
                    <p class="text-sm font-semibold text-blue-700">Right: uv-plane</p>
                    <p class="text-xs text-gray-600">Transformed view</p>
                </div>
            </div>
            <div class="bg-purple-50 p-3 rounded-lg mt-3">
                <p class="text-sm text-gray-600"><strong>Pro tip:</strong> Drag the controls panel anywhere you like!</p>
            </div>
        </div>
    `,
    posCSS: [["left", "50%"], ["top", "30%"], ["transform", "translate(-50%, 0)"], ["margin", "0"]],
    expandMenu: false,
    attachTo: null,
};
