import Tetromino from "./Tetromino.js";
import Cell from "./Cell.js";
export default class Renderer {
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

    drawTetromino(cells, colors) {
        for (let cell of cells) {
            this.#ctx.clearRect(cell.x, cell.y, cell.size, cell.size);
            this.#ctx.fillStyle = this.createGradient(cell, colors[0], colors[1]);
            this.#ctx.lineWidth = 2;
            this.#ctx.strokeStyle = Renderer.COLORS.tetrominoBorder;
            this.#ctx.fillRect(cell.x, cell.y, cell.size, cell.size);
            this.drawTetrominoBorder(cell);
        }
    }

    drawExplodingBlock(block) {
        this.saveCtxAndMakeAlpha(block.alpha)
        this.#ctx.translate(block.x + block.size / 2, block.y + block.size / 2);
        this.#ctx.rotate(block.rotation);
        this.#ctx.fillStyle = block.color;
        this.#ctx.fillRect(-block.size / 2, -block.size / 2, block.size, block.size);
        this.#ctx.restore();
    }

    drawNextTetrominoWindow(field, nextTetrominoShape) {
        const boxSize = field.cellSize * 5;
        const boxX = field.startX + field.width + 20;
        const boxY = field.startY + 2*field.cellSize;

        this.#ctx.fillStyle = Renderer.COLORS.glassFill;
        this.#ctx.strokeStyle = Renderer.COLORS.glassStroke;
        this.#ctx.lineWidth = 2;
        this.#ctx.fillRect(boxX, boxY, boxSize, boxSize);
        this.#ctx.strokeRect(boxX, boxY, boxSize, boxSize);
        const shape = Tetromino.SHAPES[nextTetrominoShape];
        const colors = Tetromino.COLORS[nextTetrominoShape];

        const minX = Math.min(...shape.map(([x]) => x));
        const minY = Math.min(...shape.map(([, y]) => y));
        const maxX = Math.max(...shape.map(([x]) => x));
        const maxY = Math.max(...shape.map(([, y]) => y));
        const offsetX = boxX + (boxSize - (maxX - minX + 1) * field.cellSize) / 2;
        const offsetY = boxY + (boxSize - (maxY - minY + 1) * field.cellSize) / 2;

        for (let [x, y] of shape) {
            const worldX = offsetX + (x - minX) * field.cellSize;
            const worldY = offsetY + (y - minY) * field.cellSize;

            const cell = new Cell(worldX, worldY, field.cellSize);
            cell.style = { type: "gradient", colors, lineWidth: 2 };

            this.drawCell(cell);
        }
    }



    clear() {
        this.#ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }


    drawField(field) {
        this.drawGlass(field);
        this.drawGrid(field);
    }

    saveCtxAndMakeAlpha(alpha) {
        this.#ctx.save();
        this.#ctx.globalAlpha = alpha;

    }

    restoreCtx() {
        this.#ctx.restore();
    }

    renderInfoPanel(level, score, timeStr, lines, offsetX, offsetY) {
        const panelWidth = 180;
        const panelHeight = 140;
        this.#ctx.save();
        this.#ctx.fillStyle = Renderer.COLORS.glassFill;
        this.#ctx.strokeStyle = Renderer.COLORS.glassStroke;
        this.#ctx.lineWidth = 2;
        this.#ctx.fillRect(offsetX, offsetY, panelWidth, panelHeight);
        this.#ctx.strokeRect(offsetX, offsetY, panelWidth, panelHeight);

        this.#ctx.font = "22px Arial";
        this.#ctx.fillStyle = "white";
        this.#ctx.textAlign = "left";
        this.#ctx.fillText("Уровень: " + level, offsetX + 16, offsetY + 32);
        this.#ctx.fillText("Очки: " + score, offsetX + 16, offsetY + 60);
        this.#ctx.fillText("Линии: " + lines, offsetX + 16, offsetY + 88);
        this.#ctx.fillText("⏱ " + timeStr, offsetX + 16, offsetY + 116);
        this.#ctx.restore();
    }
}