export default class ExplodingBlock {
    constructor(cell, color) {
        this.x = cell.x;
        this.y = cell.y;
        this.size = Math.round(cell.size / 2);
        this.color = color;

        // скорости в px/s (подбирай)
        this.vx = (Math.random() - 0.5) * 300;         // от -150 до +150 px/s
        this.vy = -(Math.random() * 200 + 150);       // от -150 до -350 px/s (вверх)

        // гравитация px/s^2
        this.gravity = 900;
        this.alpha = 1;

        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 8; // ±4 rad/s

        this.alphaDecay = 1.2; // значит ~0.83 сек до исчезновения
    }

    update(delta) {
        // delta приходит в миллисекундах — переводим в секунды
        const dt = Math.min(delta / 1000, 0.05); // капаем dt, чтобы избежать больших скачков (табы/заморозки)

        // физика
        this.vy += this.gravity * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // вращение
        this.rotation += this.rotationSpeed * dt;

        // уменьшение прозрачности
        this.alpha -= this.alphaDecay * dt;
        if (this.alpha < 0) this.alpha = 0;
    }

    isDone() {
        return this.alpha <= 0;
    }
}