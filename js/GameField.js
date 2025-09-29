import Cell from "./Cell.js";

export default class GameField {
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
    checkGameOver() {
        for (let x = 0; x < this.#cols; x++) {
            for (let y = 1; y >= 0; y--) {
                const cell = this.getCellByIndex(x, y);
                if (cell.isOccupied) {
                    return true;
                }
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
        return fullLines;
    }

    removeFullLines(lines) {
        lines.sort((a, b) => a - b);
        for (let line of lines) {
            this.clearLine(line);
        }
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
    getCellColor(x, y) {
        const cell = this.getCellByIndex(x, y);
        if (cell.isOccupied && cell.style && cell.style.type === 'gradient') {
            return cell.style.colors[0];
        }
    }

    getTetrominoCells(tetromino) {
        const result = [];
        for (let [x, y] of tetromino.coords) {
            const [worldX, worldY] = this.getRealCoors(x, y);
            const cell = this.getCellByCoords(worldX, worldY);
            result.push(cell);
        }
        return result;
    }
}