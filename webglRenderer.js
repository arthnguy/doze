class WebGLRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        
        if (!this.gl) {
            throw new Error('WebGL not supported');
        }

        this.initShaders();
        this.initBuffers();
        this.lineSegments = [];
    }

    initShaders() {
        const vertexShaderSource = `
            attribute vec2 a_position;
            uniform vec2 u_resolution;
            
            void main() {
                vec2 clipSpace = (a_position / u_resolution) * 2.0 - 1.0;
                gl_Position = vec4(clipSpace.x, -clipSpace.y, 0.0, 1.0);
            }
        `;

        const fragmentShaderSource = `
            precision mediump float;
            uniform vec4 u_color;
            
            void main() {
                gl_FragColor = u_color;
            }
        `;

        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

        this.program = this.createProgram(vertexShader, fragmentShader);
        
        this.positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
        this.resolutionLocation = this.gl.getUniformLocation(this.program, 'u_resolution');
        this.colorLocation = this.gl.getUniformLocation(this.program, 'u_color');
    }

    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }
        
        return shader;
    }

    createProgram(vertexShader, fragmentShader) {
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error('Program link error:', this.gl.getProgramInfoLog(program));
            this.gl.deleteProgram(program);
            return null;
        }
        
        return program;
    }

    initBuffers() {
        this.positionBuffer = this.gl.createBuffer();
    }

    clear() {
        this.gl.clearColor(1.0, 1.0, 1.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.lineSegments = [];
    }

    addLineSegment(x1, y1, x2, y2) {
        this.lineSegments.push(x1, y1, x2, y2);
    }

    render(color = [1.0, 0.0, 0.0, 1.0]) {
        if (this.lineSegments.length === 0) return;

        this.gl.useProgram(this.program);
        
        // Set resolution
        this.gl.uniform2f(this.resolutionLocation, this.canvas.width, this.canvas.height);
        
        // Set color
        this.gl.uniform4fv(this.colorLocation, color);
        
        // Upload line segments
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.lineSegments), this.gl.STATIC_DRAW);
        
        // Enable attribute
        this.gl.enableVertexAttribArray(this.positionLocation);
        this.gl.vertexAttribPointer(this.positionLocation, 2, this.gl.FLOAT, false, 0, 0);
        
        // Enable line smoothing
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this.gl.lineWidth(2.0);
        
        // Draw lines
        this.gl.drawArrays(this.gl.LINES, 0, this.lineSegments.length / 2);
    }

    drawAxes(xStart, xEnd, yStart, yEnd, width, height) {
        const graphToCanvas = (x, y) => {
            return {
                x: ((x - xStart) / (xEnd - xStart)) * width,
                y: ((-y - yStart) / (yEnd - yStart)) * height
            };
        };

        // X-axis
        const xAxisStart = graphToCanvas(xStart, 0);
        const xAxisEnd = graphToCanvas(xEnd, 0);
        this.addLineSegment(xAxisStart.x, xAxisStart.y, xAxisEnd.x, xAxisEnd.y);
        
        // Y-axis
        const yAxisStart = graphToCanvas(0, yStart);
        const yAxisEnd = graphToCanvas(0, yEnd);
        this.addLineSegment(yAxisStart.x, yAxisStart.y, yAxisEnd.x, yAxisEnd.y);
        
        // Render axes in black
        this.render([0.0, 0.0, 0.0, 1.0]);
        this.lineSegments = [];
    }
}
