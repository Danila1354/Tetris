export default class Tetromino {
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
        GHOST: ["rgba(245, 245, 245, 0.25)", "rgba(210, 210, 210, 0.15)"]
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
            "L>0": [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],

            "0>L": [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
            "L>2": [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
            "2>R": [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
            "R>0": [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]]
        },
        I: {
            "0>R": [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
            "R>2": [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
            "2>L": [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
            "L>0": [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],

            "0>L": [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
            "L>2": [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
            "2>R": [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
            "R>0": [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]]
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