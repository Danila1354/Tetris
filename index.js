function initCanvas() {
    const canvas = document.getElementById("canvas");
    const scale = window.devicePixelRatio || 1;

    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";

    canvas.width = window.innerWidth * scale;
    canvas.height = window.innerHeight * scale;

    const ctx = canvas.getContext("2d");
    ctx.scale(scale, scale);

    return ctx;
}


class Cell {
    #x;
    #y;
    #size;

    constructor(x, y, size) {
        this.#x = x;
        this.#y = y;
        this.#size = size;

        this.isOccupied = false;
        this.style = null
    }

    get x() {
        return this.#x;
    }

    get y() {
        return this.#y;
    }

    get size() {
        return this.#size;
    }

    move(dx, dy) {
        this.#x += dx;
        this.#y += dy;
    }

    setPosition(x, y) {
        this.#x = x;
        this.#y = y;
    }
}

class Renderer {
    #ctx;

    static COLORS = {
        glassFill: "#222831",
        glassStroke: "#fff",
        gridStroke: "rgba(255, 255, 255, 0.05)",
        tetrominoBorder: "#444"
    };


    constructor(ctx) {
        this.#ctx = ctx;
    }

    drawGlass(field) {
        this.#ctx.fillStyle = Renderer.COLORS.glassFill;
        this.#ctx.fillRect(field.startX - 2, field.yWithoutTwoRows, field.width + 2, field.height - 2 * field.cellSize);
        this.#ctx.strokeStyle = Renderer.COLORS.glassStroke;
        this.#ctx.lineWidth = 2;
        this.#ctx.beginPath();
        this.#ctx.moveTo(field.startX - this.#ctx.lineWidth, field.yWithoutTwoRows);
        this.#ctx.lineTo(field.startX - this.#ctx.lineWidth, field.startY + this.#ctx.lineWidth + field.height);
        this.#ctx.lineTo(field.startX + this.#ctx.lineWidth + field.width, field.startY + this.#ctx.lineWidth + field.height);
        this.#ctx.lineTo(field.startX + this.#ctx.lineWidth + field.width, field.yWithoutTwoRows);
        this.#ctx.stroke()
    }

    drawGrid(field) {
        for (let y = 0; y < field.rows; y++) {
            for (let x = 0; x < field.cols; x++) {
                if (y < 2) continue;
                const cell = field.getCellByIndex(x, y);
                if (!cell.isOccupied) {
                    cell.style = {
                        type: "commonColor",
                        color: Renderer.COLORS.gridStroke,
                        fill: Renderer.COLORS.glassFill,
                        lineWidth: 2
                    };
                    this.drawCell(cell);
                }
            }
        }

        // Потом уже занятые клетки (с градиентом)
        for (let y = 0; y < field.rows; y++) {
            for (let x = 0; x < field.cols; x++) {
                if (y < 2) continue;
                const cell = field.getCellByIndex(x, y);
                if (cell.isOccupied) {
                    this.drawCell(cell);
                }
            }
        }
        this.#ctx.beginPath();
        this.#ctx.lineWidth = 2;
        this.#ctx.strokeStyle = Renderer.COLORS.gridStroke;
        this.#ctx.moveTo(field.startX, field.yWithoutTwoRows);
        this.#ctx.lineTo(field.startX, field.startY + field.height);
        this.#ctx.lineTo(field.startX + field.width, field.startY + field.height);
        this.#ctx.lineTo(field.startX + field.width, field.yWithoutTwoRows);
        this.#ctx.stroke()

    }

    drawCellWithoutGradient(cell, color, lineWidth = 2, fill = null) {
        this.#ctx.clearRect(cell.x, cell.y, cell.size, cell.size);
        if (fill) {
            this.#ctx.fillStyle = fill;
            this.#ctx.fillRect(cell.x, cell.y, cell.size, cell.size);
        }
        this.#ctx.strokeStyle = color;
        this.#ctx.lineWidth = lineWidth;
        this.#ctx.strokeRect(cell.x, cell.y, cell.size, cell.size);
    }

    drawCell(cell) {
        if (cell.style.type === 'gradient') {
            this.drawCellGradient(cell, cell.style.colors, cell.lineWidth);
        } else {
            this.drawCellWithoutGradient(cell, cell.style.color, cell.lineWidth, cell.style.fill);
        }
    }

    createGradient(cell, colorStart, colorEnd) {
        const gradient = this.#ctx.createLinearGradient(
            cell.x, cell.y + cell.size / 2,
            cell.x + cell.size, cell.y + cell.size / 2
        );
        gradient.addColorStop(0, colorStart);
        gradient.addColorStop(1, colorEnd);
        return gradient;
    }

    drawCellGradient(cell, colors, lineWidth = 2) {
        this.#ctx.clearRect(cell.x, cell.y, cell.size, cell.size);
        this.#ctx.fillStyle = this.createGradient(cell, colors[0], colors[1]);
        this.#ctx.fillRect(cell.x, cell.y, cell.size, cell.size);

        this.#ctx.strokeStyle = Renderer.COLORS.tetrominoBorder;
        this.#ctx.lineWidth = lineWidth;
        this.#ctx.strokeRect(cell.x, cell.y, cell.size, cell.size);
    }


    drawTetrominoBorder(cell) {
        this.#ctx.beginPath();
        this.#ctx.moveTo(cell.x, cell.y);
        this.#ctx.lineTo(cell.x + cell.size, cell.y);
        this.#ctx.lineTo(cell.x + cell.size, cell.y + cell.size);
        this.#ctx.lineTo(cell.x, cell.y + cell.size);
        this.#ctx.closePath();
        this.#ctx.stroke();
    }

    drawTetromino(tetromino) {
        const tetrominoCoords = tetromino.coords;
        const colors = tetromino.colors;

        for (let [x, y] of tetrominoCoords) {
            const [worldX, worldY] = field.getRealCoors(x, y);
            const cell = field.getCellByCoords(worldX, worldY);

            this.#ctx.clearRect(worldX, worldY, cell.size, cell.size);
            this.#ctx.fillStyle = this.createGradient(cell, colors[0], colors[1]);
            this.#ctx.lineWidth = 2;
            this.#ctx.strokeStyle = Renderer.COLORS.tetrominoBorder;
            this.#ctx.fillRect(worldX, worldY, cell.size, cell.size);
            this.drawTetrominoBorder(cell);
        }
    }



    clear() {
        this.#ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }


    drawField(field) {
        this.drawGlass(field);
        this.drawGrid(field);
    }

    saveCtxAndMakeAlpha(alpha){
        this.#ctx.save();
        this.#ctx.globalAlpha = alpha;

    }
    restoreCtx(){
        this.#ctx.restore();
    }
}


class GameField {
    #cols;
    #rows;
    #cellSize;
    #startX;
    #startY;
    #yWithoutTwoRows;
    #cells;

    constructor(cols, rows, cellSize) {
        this.#cols = cols;
        this.#rows = rows;
        this.#cellSize = cellSize;
        this.#startX = (window.innerWidth - cols * cellSize) / 2;
        this.#startY = (window.innerHeight - rows * cellSize) / 2;
        this.#yWithoutTwoRows = this.#startY + 2 * cellSize;

        this.#cells = [];

        for (let y = 0; y < this.#rows; y++) {
            this.#cells[y] = [];
            for (let x = 0; x < this.#cols; x++) {
                const [worldX, worldY] = this.getRealCoors(x, y);
                this.#cells[y][x] = new Cell(worldX, worldY, this.#cellSize);
            }
        }
    }

    getCellByIndex(x, y) {
        if (y < 0 || y >= this.#rows || x < 0 || x >= this.#cols) {
            throw new RangeError(`Cell coordinates out of bounds: (${x}, ${y})`);
        }
        return this.#cells[y][x];
    }

    getCellByCoords(worldX, worldY) {
        const x = Math.floor((worldX - this.#startX) / this.#cellSize);
        const y = Math.floor((worldY - this.#startY) / this.#cellSize);
        return this.getCellByIndex(x, y);
    }

    getRealCoors(x, y) {
        if (y < 0 || y >= this.#rows || x < 0 || x >= this.#cols) {
            throw new RangeError(`Cell coordinates out of bounds: (${x}, ${y})`);
        }
        const worldX = this.#startX + x * this.#cellSize;
        const worldY = this.#startY + y * this.#cellSize;
        return [worldX, worldY];
    }

    checkCoords(coords) {
        for (let [x, y] of coords) {
            if (x < 0 || x >= this.#cols || y < 0 || y >= this.#rows) {
                return false;
            }
            const cell = this.getCellByIndex(x, y);
            if (cell.isOccupied) {
                return false;
            }
        }
        return true;
    }

    checkValidPlacement(tetromino) {
        return this.checkCoords(tetromino.coords);
    }

    checkNextPosition(tetromino, dx, dy) {
        const newCoords = tetromino.coords.map(([x, y]) => [x + dx, y + dy]);
        return this.checkCoords(newCoords);
    }

    checkEndOfGlass(tetromino) {
        for (let [x, y] of tetromino.coords) {
            if (y >= this.#rows) {
                return true;
            }
        }
        return false;
    }

    checkCollision(tetromino) {
        const tetrominoCoords = tetromino.coords;
        for (let [x, y] of tetrominoCoords) {
            if (y < 0 || y >= this.#rows || x < 0 || x >= this.#cols) {
                continue;
            }
            const cell = this.getCellByIndex(x, y);
            if (cell.isOccupied) {
                return true;
            }
        }
        return false;
    }


    fixTetromino(tetromino) {
        const tetrominoCoords = tetromino.coords;
        const colors = tetromino.colors;
        for (let [x, y] of tetrominoCoords) {
            const cell = this.getCellByIndex(x, y);
            cell.isOccupied = true;
            cell.style = {type: "gradient", colors: [colors[0], colors[1]], lineWidth: 2};
        }
    }

    checkFullLines() {
        let fullLines = [];
        for (let y = 0; y < this.#rows; y++) {
            let isFull = true;
            for (let x = 0; x < this.#cols; x++) {
                const cell = this.getCellByIndex(x, y);
                if (!cell.isOccupied) {
                    isFull = false;
                    break;
                }
            }
            if (isFull) {
                fullLines.push(y);
            }
        }
        for (let line of fullLines) {
            this.clearLine(line);
        }
        return fullLines.length;
    }

    clearLine(line) {
        for (let x = 0; x < this.#cols; x++) {
            const cell = this.getCellByIndex(x, line);
            cell.isOccupied = false;
            cell.style = null;
        }
        for (let y = line; y > 0; y--) {
            for (let x = 0; x < this.#cols; x++) {
                const aboveCell = this.getCellByIndex(x, y - 1);
                const currentCell = this.getCellByIndex(x, y);
                currentCell.isOccupied = aboveCell.isOccupied;
                currentCell.style = aboveCell.style;
            }
        }
        for (let x = 0; x < this.#cols; x++) {
            const cell = this.getCellByIndex(x, 0);
            cell.isOccupied = false;
            cell.style = null;
        }
    }

    get cols() {
        return this.#cols;
    }

    get rows() {
        return this.#rows;
    }

    get startX() {
        return this.#startX;
    }

    get startY() {
        return this.#startY;
    }

    get width() {
        return this.#cols * this.#cellSize;
    }

    get height() {
        return this.#rows * this.#cellSize;
    }

    get cellSize() {
        return this.#cellSize;
    }

    get yWithoutTwoRows() {
        return this.#yWithoutTwoRows;
    }
}


class Tetromino {
    #shape;
    #coords;
    #orientation;
    #baseCoords;
    static COLORS = {
        I: ["#00e5ff", "#0099cc"],
        O: ["#ffeb3b", "#fbc02d"],
        T: ["#9c27b0", "#4a148c"],
        L: ["#ff9800", "#e65100"],
        J: ["#3f51b5", "#1a237e"],
        S: ["#a8e063", "#56ab2f"],
        Z: ["#f44336", "#b71c1c"],
        GHOST: ["rgba(150, 150, 150, 0.7)", "rgba(100, 100, 100, 0.5)"]
    };
    static SHAPES = {
        I: [[0, 0], [1, 0], [2, 0], [3, 0]],
        O: [[0, 0], [1, 0], [0, 1], [1, 1]],
        T: [[1, 0], [0, 1], [1, 1], [2, 1]],
        L: [[0, 1], [1, 1], [2, 1], [2, 0]],
        J: [[0, 0], [0, 1], [1, 1], [2, 1]],
        S: [[1, 0], [2, 0], [0, 1], [1, 1]],
        Z: [[0, 0], [1, 0], [1, 1], [2, 1]]
    };
    static PIVOTS = {
        I: [1.5, 0.0],
        O: [],
        T: [1, 1],
        L: [1, 1],
        J: [1, 1],
        S: [1, 1],
        Z: [1, 1]
    }
    static KICKS = {
        JLSTZ: {
            "0>R": [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
            "R>2": [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
            "2>L": [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
            "L>0": [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]]
        },
        I: {
            "0>R": [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
            "R>2": [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
            "2>L": [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
            "L>0": [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]]
        }
    };


    constructor(shape) {
        this.#shape = shape;
        this.#baseCoords = Tetromino.SHAPES[shape].map(([x, y]) => [x, y]);
        this.#coords = Tetromino.SHAPES[shape].map(([x, y]) => [x, y]);
        this.#orientation = '0';
        this.colors = Tetromino.COLORS[shape];
    }

    copyFrom(other) {
        this.#shape = other.shape;
        this.#baseCoords = other.baseCoords.map(([x, y]) => [x, y]);
        this.#coords = other.coords.map(([x, y]) => [x, y]);
        this.#orientation = other.orientation;
    }

    get coords() {
        return this.#coords;
    }

    set coords(newCoords) {
        this.#coords = newCoords;
    }

    get shape() {
        return this.#shape;
    }

    get orientation() {
        return this.#orientation;
    }

    set orientation(newOrientation) {
        this.#orientation = newOrientation;
    }

    get baseCoords() {
        return this.#baseCoords;
    }

    set baseCoords(newBaseCoords) {
        this.#baseCoords = newBaseCoords;
    }

    moveDown() {
        this.#coords = this.#coords.map(([x, y]) => [x, y + 1]);
    }

    moveUp() {
        this.#coords = this.#coords.map(([x, y]) => [x, y - 1]);
    }

    moveLeft() {
        this.#coords = this.#coords.map(([x, y]) => [x - 1, y]);
    }

    moveRight() {
        this.#coords = this.#coords.map(([x, y]) => [x + 1, y]);
    }


    getWidth() {
        const xs = this.#coords.map(([x, y]) => x);
        return Math.max(...xs) - Math.min(...xs) + 1;
    }

    getYMax() {
        const ys = this.#coords.map(([x, y]) => y);
        return Math.max(...ys);
    }

    setSpawnCoords(spawnX, spawnY) {
        this.#coords = this.#coords.map(([x, y]) => [x + spawnX, y + spawnY]);
    }

    getOffsetCoords() {
        const offsetX = Math.abs(this.coords[0][0] - this.#baseCoords[0][0]);
        const offsetY = Math.abs(this.coords[0][1] - this.#baseCoords[0][1]);
        return [offsetX, offsetY];
    }

    rotate(direction = 1) {
        const pivot = Tetromino.PIVOTS[this.#shape];
        if (!pivot || pivot.length === 0) return;

        const [px, py] = pivot;
        const [dx, dy] = this.getOffsetCoords();

        this.#baseCoords = this.#baseCoords.map(([x, y]) => {
            let newX, newY;
            if (direction === 1) {
                newX = px - (y - py);
                newY = py + (x - px);
            } else {
                newX = px + (y - py);
                newY = py - (x - px);
            }

            if (this.#shape === 'I') {
                return [Math.round(newX), Math.round(newY)];
            }
            return [newX, newY];
        });

        this.#coords = this.#baseCoords.map(([x, y]) => [x + dx, y + dy]);

        const orientations = ['0', 'R', '2', 'L'];
        const idx = orientations.indexOf(this.#orientation);
        this.#orientation = orientations[(idx + direction + 4) % 4];
    }
}

class Game {
    #field;
    #renderer;
    #currentTetromino;
    #input;
    #lastDropTime;
    #dropInterval;
    #ghostTetromino;
    #tetrominoBag;

    #isLocking = false;
    #lockTimer = 0;
    #lockDelayWithoutActions = 1000;

    #lastDropY = null;
    #maxLockDrops = 15;
    #lockDrops = 0;
    #pulseTime = 0;

    constructor(field, renderer) {
        this.#field = field;
        this.#renderer = renderer;
        this.#currentTetromino = null;
        this.#ghostTetromino = null;
        this.#tetrominoBag = new TetrominoBag();
        this.#input = new InputHandler();
        this.#lastDropTime = 0;
        this.#dropInterval = 500;
        this.explodingBlocks = [];
        this.blockSize = 30;
    }

    start() {
        this.#currentTetromino = new Tetromino(this.#tetrominoBag.getNext());
        this.setCenterCoords();

        this.lastTime = performance.now();
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }

    gameLoop(timestamp) {
        const delta = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(delta);
        this.render();

        requestAnimationFrame((ts) => this.gameLoop(ts));
    }

    performAction(action) {
        const actions = {
            left: () => this.tryMove(-1, 0),
            right: () => this.tryMove(1, 0),
            down: () => this.tryMove(0, 1),
            rotate: () => this.tryRotate(),
            drop: () => this.hardDrop()
        };

        if (actions[action]) {
            actions[action]();
            return true
        }
        return false;
    }


    update(delta) {
        const now = performance.now();
        const inputs = [
            ["ArrowLeft", "left"],
            ["ArrowRight", "right"],
            ["ArrowDown", "down"],
            ["ArrowUp", "rotate"],
            ["Space", "drop"]
        ];

        for (const [key, action] of inputs) {
            if (this.#input.shouldTrigger(key, now)) {
                const actionDo = this.performAction(action);
                if (this.#isLocking && actionDo) {
                    this.#lockDrops += 1;
                    this.#lockTimer = 0;
                }

            }
        }
        this.#lastDropTime += delta;
        this.#ghostTetromino.copyFrom(this.#currentTetromino);
        this.hardDrop(true);

        const canFall = this.#field.checkNextPosition(this.#currentTetromino, 0, 1);

        if (!canFall) {
            if (!this.#isLocking) {
                this.#isLocking = true;
                this.#lockTimer = 0;
                this.#lastDropY = this.#currentTetromino.getYMax();
                this.#lockDrops = 0;
            } else {
                this.#lockTimer += delta;
                if (this.#lockDrops > this.#maxLockDrops || this.#lockTimer >= this.#lockDelayWithoutActions) {
                    this.lockCurrentTetromino();
                    this.#isLocking = false;
                    this.#lockTimer = 0;
                    this.#lockDrops = 0;
                }
            }
        }
        else{
            if (this.#isLocking) {
                const currentY = this.#currentTetromino.getYMax();
                if (currentY > this.#lastDropY) {
                    this.#lockDrops = 0;
                    this.#isLocking = false;
                    this.#lockTimer = 0;
                }
            }

        }
        if (this.#lastDropTime >= this.#dropInterval) {
            if (this.#field.checkNextPosition(this.#currentTetromino, 0, 1)) {
                this.#currentTetromino.moveDown();
            }
            this.#lastDropTime = 0;
        }
        if (this.#isLocking) {
            this.#pulseTime += delta;
        } else {
            this.#pulseTime = 0;
        }
    }



    setCenterCoords() {
        const spawnX = Math.floor((this.#field.cols - this.#currentTetromino.getWidth()) / 2);
        const spawnY = 0;
        this.#currentTetromino.setSpawnCoords(spawnX, spawnY);
        if (!this.#ghostTetromino) {
            this.#ghostTetromino = new Tetromino(this.#currentTetromino.shape);
            this.#ghostTetromino.colors = Tetromino.COLORS.GHOST;
        }
    }

    tryMove(dx, dy) {
        const key = `${dx},${dy}`;
        const moveMethods = {
            "0,1": () => this.#currentTetromino.moveDown(),
            "0,-1": () => this.#currentTetromino.moveUp(),
            "1,0": () => this.#currentTetromino.moveRight(),
            "-1,0": () => this.#currentTetromino.moveLeft()
        };
        if (!moveMethods[key]) return false;

        if (this.#field.checkNextPosition(this.#currentTetromino, dx, dy)) {
            moveMethods[key]();
            return true;
        }
        return false;
    }

    hardDrop(isGhost = false) {
        const tetromino = isGhost ? this.#ghostTetromino : this.#currentTetromino;
        while (this.#field.checkNextPosition(tetromino, 0, 1)) {
            tetromino.moveDown();
        }
        if (!isGhost) {
            this.lockCurrentTetromino();
            triggerShakeY();
        }

    }

    lockCurrentTetromino() {
        const fullLines = this.#field.checkFullLines();
        if (fullLines.length) {
            fullLines.forEach(y => {
                for (let x = 0; x < this.#field.cols; x++) {
                    const color = this.#field.getCellColor(x, y);
                    const px = x * this.blockSize;
                    const py = y * this.blockSize;
                    this.explodingBlocks.push(new ExplodingBlock(px, py, color, this.blockSize));
                }
            });
            this.#field.removeFullLines(fullLines); // очищаем линии в поле
        }

        this.#currentTetromino = new Tetromino(this.#tetrominoBag.getNext());
        this.setCenterCoords();
    }


    render() {
        this.#renderer.clear();
        this.#renderer.drawField(this.#field);
        this.#renderer.drawTetromino(this.#ghostTetromino);
        if (this.#isLocking) {
            const pulse = (Math.sin(this.#pulseTime * 0.02) + 1) / 2;
            this.#renderer.saveCtxAndMakeAlpha(0.4+0.6*pulse);
        }
        this.#renderer.drawTetromino(this.#currentTetromino);
        this.#renderer.restoreCtx();
    }

    tryRotate(direction = 1) {
        const oldCoords = this.#currentTetromino.coords.map(([x, y]) => [x, y]);
        const oldBase = this.#currentTetromino.baseCoords.map(([x, y]) => [x, y]);
        const oldOrientation = this.#currentTetromino.orientation;

        this.#currentTetromino.rotate(direction);

        if (this.#field.checkValidPlacement(this.#currentTetromino)) {
            return true;
        }

        const from = oldOrientation;
        const to = this.#currentTetromino.orientation;
        const key = `${from}>${to}`;

        const kicks =
            this.#currentTetromino.shape === 'I'
                ? Tetromino.KICKS.I[key]
                : Tetromino.KICKS.JLSTZ[key];

        if (kicks) {
            for (let [dx, dy] of kicks) {
                this.#currentTetromino.coords = this.#currentTetromino.coords.map(([x, y]) => [x + dx, y - dy]);
                if (this.#field.checkValidPlacement(this.#currentTetromino)) {
                    return true;
                }
                this.#currentTetromino.coords = this.#currentTetromino.coords.map(([x, y]) => [x - dx, y + dy]);
            }
        }

        // Восстанавливаем старые координаты, если не получилось
        this.#currentTetromino.coords = oldCoords;
        this.#currentTetromino.baseCoords = oldBase;
        this.#currentTetromino.orientation = oldOrientation;
        return false;
    }
}

class InputHandler {
    constructor() {
        this.pressed = {};
        this.lastActionTime = {};
        this.repeatDelay = 200;
        this.repeatRate = 50;

        this.noRepeatKeys = ["ArrowUp", "Space"];

        window.addEventListener("keydown", (e) => {
            if (!this.pressed[e.code]) {
                this.pressed[e.code] = true;
                this.lastActionTime[e.code] = 0;
            }
        });

        window.addEventListener("keyup", (e) => {
            this.pressed[e.code] = false;
            this.lastActionTime[e.code] = 0;
        });
    }

    shouldTrigger(key, now) {
        if (!this.pressed[key]) return false;

        // для кнопок без автоповтора
        if (this.noRepeatKeys.includes(key)) {
            if (this.lastActionTime[key] === 0) {
                this.lastActionTime[key] = now;
                return true;
            }
            return false;
        }

        const last = this.lastActionTime[key] || 0;

        // первое срабатывание
        if (last === 0) {
            this.lastActionTime[key] = now;
            return true;
        }

        const elapsed = now - last;

        // после задержки включаем автоповтор
        if (elapsed >= this.repeatDelay) {
            this.lastActionTime[key] = now - (elapsed - this.repeatRate);
            return true;
        }

        return false;
    }
}

class TetrominoBag {
    constructor() {
        this.bag = [];
        this.refillBag();
    }

    refillBag() {
        this.bag = ["I", "J", "L", "O", "S", "T", "Z"];
        this.shuffle();
    }

    shuffle() {
        for (let i = this.bag.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
        }
        return this.bag;
    }

    getNext() {
        if (this.bag.length === 0) this.refillBag();
        return this.bag.pop();
    }
}

function triggerShakeY() {
    const canvas = document.querySelector("canvas");
    canvas.classList.remove("shake-y");
    void canvas.offsetWidth;
    canvas.classList.add("shake-y");
}



class ExplodingBlock {
    constructor(x, y, color, size) {
        this.x = x; // пиксели
        this.y = y;
        this.color = color;
        this.size = size || 20;
        this.vx = (Math.random() - 0.5) * 6; // скорость по x
        this.vy = -Math.random() * 5 - 2;    // скорость вверх
        this.alpha = 1;
        this.gravity = 0.3;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
    }

    update(delta) {
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotationSpeed;
        this.alpha -= 0.02; // постепенно исчезает
        if (this.alpha < 0) this.alpha = 0;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x + this.size/2, this.y + this.size/2);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
        ctx.restore();
    }

    isDone() {
        return this.alpha <= 0;
    }
}
const ctx = initCanvas();
r = new Renderer(ctx)
field = new GameField(10, 22, 30)
let g = new Game(field, r)
g.start();