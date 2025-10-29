export default class TetrominoBag {
    constructor() {
        this.bag = [];
        this.#refillBag();
    }

    #refillBag() {
        this.bag = ["I", "J", "L", "O", "S", "T", "Z"];
        this.#shuffle();
    }

    #shuffle() {
        for (let i = this.bag.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
        }
        return this.bag;
    }

    getNext() {
        if (this.bag.length === 0) this.#refillBag();
        return this.bag.pop();
    }
    viewNext() {
        if (this.bag.length === 0) this.#refillBag();
        return this.bag[this.bag.length - 1];
    }
}