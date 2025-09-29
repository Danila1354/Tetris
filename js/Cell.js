export default class Cell {
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
}