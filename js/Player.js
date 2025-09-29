export default class Player {
    #name;
    #score;
    #lines;
    #level;

    constructor(name) {
        this.#name = name;
        this.#score = 0;
        this.#lines = 0;
        this.#level = 1;
    }

    addScore(points) {
        this.#score += points;
    }

    addLines(count) {
        this.#lines += count;
        if (this.#lines >= this.#level * 10) { // каждые 10 линий = новый уровень
            this.#level++;
            return true; // сигнализируем, что уровень изменился
        }
        return false;
    }

    get score() {
        return this.#score;
    }

    get lines() {
        return this.#lines;
    }

    get level() {
        return this.#level;
    }

    get name() {
        return this.#name;
    }
}