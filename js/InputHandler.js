export default class InputHandler {
    constructor() {
        this.pressed = {};
        this.lastActionTime = {};
        this.repeatDelay = 200;
        this.repeatRate = 50;

        this.noRepeatKeys = ["ArrowUp", "Space", "KeyZ"];

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

        if (this.noRepeatKeys.includes(key)) {
            if (this.lastActionTime[key] === 0) {
                this.lastActionTime[key] = now;
                return true;
            }
            return false;
        }

        const last = this.lastActionTime[key] || 0;

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