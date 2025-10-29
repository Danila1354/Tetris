import Tetromino from "./Tetromino.js";
import Cell from "./Cell.js";
export default class Renderer {
    #ctx;
    #colors;
    #layout = {};
    #fonts = {};
    #canvas;
    constructor() {
        this.#canvas = document.getElementById("canvas");
        this.#ctx = this.initCanvas();
        this.#colors = {
            glassFill: "rgba(20, 20, 40, 0.9)",
            glassStroke: "rgba(138, 43, 226, 0.8)",
            gridStroke: "#1a1a2e",
            tetrominoBorder: "#1a1a2e",
            gradientStart: "#1b1b33",
            gradientEnd: "#2a2a48",
            glow: "rgba(138, 43, 226, 0.7)",
        };
        this.#fonts = {
            infoPanel: "22px Comic Sans MS",
            controls: "14px Comic Sans MS",
            scoresTableTitle: "22px Comic Sans MS",
            scoresTableRows: "17px Comic Sans MS"
        };
    }
    initCanvas(){
        const scale = window.devicePixelRatio || 1; // for high-DPI screens
        this.#canvas.style.width = window.innerWidth + "px";
        this.#canvas.style.height = window.innerHeight + "px";

        this.#canvas.width = window.innerWidth * scale;
        this.#canvas.height = window.innerHeight * scale;

        const ctx = this.#canvas.getContext("2d");
        ctx.scale(scale, scale);
        return ctx;
    }
    initLayout(field) {
        this.#layout.infoPanel = {
            x: field.startX - 200,
            y: field.startY + 60
        };
        this.#layout.scoresTable = {
            x: 30,
            y: this.#layout.infoPanel.y,
        };

        this.#layout.controls = {
            x: field.startX + field.width + 20,
            y: field.startY + field.cellSize * 7.5
        };

        this.#layout.nextBox = {
            x: field.startX + field.width + 20,
            y: field.startY + 2 * field.cellSize,
            size: field.cellSize * 5
        };
    }

    drawGlass(field) {
        const gradient = this.#ctx.createLinearGradient(
            field.startX, field.yWithoutTwoRows,
            field.startX, field.startY + field.height
        );
        gradient.addColorStop(0, this.#colors.gradientStart);
        gradient.addColorStop(1, this.#colors.gradientEnd);

        this.#ctx.fillStyle = gradient;
        this.#ctx.fillRect(
            field.startX - 2,
            field.yWithoutTwoRows,
            field.width + 2,
            field.height - 2 * field.cellSize
        );

        this.#ctx.strokeStyle = this.#colors.glassStroke;
        this.#ctx.lineWidth = 2;
        this.#ctx.shadowColor = this.#colors.glow;
        this.#ctx.shadowBlur = 10;

        this.#ctx.beginPath();
        this.#ctx.moveTo(field.startX - this.#ctx.lineWidth, field.yWithoutTwoRows);
        this.#ctx.lineTo(field.startX - this.#ctx.lineWidth, field.startY + this.#ctx.lineWidth + field.height);
        this.#ctx.lineTo(field.startX + this.#ctx.lineWidth + field.width, field.startY + this.#ctx.lineWidth + field.height);
        this.#ctx.lineTo(field.startX + this.#ctx.lineWidth + field.width, field.yWithoutTwoRows);
        this.#ctx.closePath();
        this.#ctx.stroke();

        this.#ctx.shadowBlur = 0;
    }

    drawGrid(field) {
        for (let y = 0; y < field.rows; y++) {
            for (let x = 0; x < field.cols; x++) {
                if (y < 2) continue;
                const cell = field.getCellByIndex(x, y);
                if (!cell.isOccupied) {
                    cell.style = {
                        type: "commonColor",
                        color: this.#colors.gridStroke,
                        fill: this.#colors.glassFill,
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
        this.#ctx.strokeStyle = this.#colors.gridStroke;
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

        this.#ctx.save();
        this.#ctx.shadowColor = colors[0];
        this.#ctx.shadowBlur = 5;

        this.#ctx.strokeStyle = this.#colors.tetrominoBorder;
        this.#ctx.lineWidth = lineWidth;
        this.#ctx.strokeRect(cell.x, cell.y, cell.size, cell.size);

        this.#ctx.restore();
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
            this.#ctx.fillRect(cell.x, cell.y, cell.size, cell.size);
            this.#ctx.save();
            this.#ctx.shadowColor = colors[1];
            this.#ctx.shadowBlur = 30;

            this.#ctx.strokeStyle = this.#colors.tetrominoBorder;
            this.#ctx.lineWidth = 2;
            this.drawTetrominoBorder(cell);

            this.#ctx.restore();
        }
    }

    drawExplodingBlock(block) {
        this.saveCtxAndMakeAlpha(block.alpha);

        this.#ctx.translate(block.x + block.size / 2, block.y + block.size / 2);
        this.#ctx.rotate(block.rotation);
        this.#ctx.save();
        this.#ctx.shadowColor = block.color;
        this.#ctx.shadowBlur = 10;

        this.#ctx.fillStyle = block.color;
        this.#ctx.fillRect(-block.size / 2, -block.size / 2, block.size, block.size);

        this.#ctx.restore();
        this.#ctx.restore();
    }

    drawNextTetrominoWindow(nextTetrominoShape) {
        const box = this.#layout.nextBox; // берём готовый layout
        const boxSize = box.size;
        const boxX = box.x;
        const boxY = box.y;

        const gradient = this.#ctx.createLinearGradient(boxX, boxY, boxX, boxY + boxSize);
        gradient.addColorStop(0, "#1b1b33");
        gradient.addColorStop(1, "#2a2a48");

        this.#ctx.fillStyle = gradient;
        this.#ctx.strokeStyle = this.#colors.glassStroke;
        this.#ctx.lineWidth = 2;
        this.#ctx.fillRect(boxX, boxY, boxSize, boxSize);
        this.#ctx.strokeRect(boxX, boxY, boxSize, boxSize);

        const shape = Tetromino.SHAPES[nextTetrominoShape];
        const colors = Tetromino.COLORS[nextTetrominoShape];
        // Вычисляем границы фигуры
        const minX = Math.min(...shape.map(([x]) => x));
        const minY = Math.min(...shape.map(([, y]) => y));
        const maxX = Math.max(...shape.map(([x]) => x));
        const maxY = Math.max(...shape.map(([, y]) => y));

        // Вычисляем отступы, чтобы центрировать фигуру в окне
        // (boxSize / 5) - размер одной клетки в окне
        // (maxX - minX + 1) и (maxY - minY + 1) - ширина и высота фигуры в клетках
        // (boxSize - ...) / 2 - оставшееся пространство, делённое пополам для отступа
        // boxX + ... и boxY + ... - сдвигаем отступы относительно позиции окна
        const offsetX = boxX + (boxSize - (maxX - minX + 1) * (boxSize / 5)) / 2;
        const offsetY = boxY + (boxSize - (maxY - minY + 1) * (boxSize / 5)) / 2;

        for (let [x, y] of shape) {
            const worldX = offsetX + (x - minX) * (boxSize / 5);
            const worldY = offsetY + (y - minY) * (boxSize / 5);

            const cell = new Cell(worldX, worldY, boxSize / 5);
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

    renderInfoPanel(username, level, score, lines) {
        const { x, y } = this.#layout.infoPanel;
        const panelWidth = 180;
        const panelHeight = 140;

        this.#ctx.save();

        const gradient = this.#ctx.createLinearGradient(x, y, x, y + panelHeight);
        gradient.addColorStop(0, this.#colors.gradientStart);
        gradient.addColorStop(1, this.#colors.gradientEnd);

        this.#ctx.fillStyle = gradient;
        this.#ctx.strokeStyle = this.#colors.glassStroke;
        this.#ctx.lineWidth = 2;
        this.#ctx.fillRect(x, y, panelWidth, panelHeight);
        this.#ctx.strokeRect(x, y, panelWidth, panelHeight);

        this.#ctx.font = this.#fonts.infoPanel;
        this.#ctx.fillStyle = "white";
        this.#ctx.textAlign = "left";

        const linesText = [
            `Player: ${username}`,
            `Level: ${level}`,
            `Score: ${score}`,
            `Lines: ${lines}`,
        ];

        const paddingTop = 25;
        const paddingBottom = 20;
        const availableHeight = panelHeight - paddingTop - paddingBottom;
        const step = availableHeight / (linesText.length - 1);

        linesText.forEach((text, i) => {
            const yPos = y + paddingTop + i * step;
            this.#ctx.fillText(text, x + 16, yPos);
        });

        this.#ctx.restore();
    }

    renderControlsInfo() {
        const { x, y } = this.#layout.controls;
        const controls = [
            "⬅ — Left move",
            "➡ — Right move",
            "⬇ — Slow drop",
            "⬆ — Rotate clockwise",
            "z — Rotate counterclockwise",
            "␣ — Hard drop",
        ];

        this.#ctx.save();
        this.#ctx.font = this.#fonts.controls;
        this.#ctx.fillStyle = "white";
        this.#ctx.textAlign = "left";
        controls.forEach((text, i) => {
            this.#ctx.fillText(text, x, y + 24 + i * 22);
        });
        this.#ctx.restore();
    }

    renderTopScoresTable(topScores) {
        const { x: offsetX, y: offsetY } = this.#layout.scoresTable;

        const rowHeight = 30;
        const tableWidth = 290;

        this.#ctx.save();

        this.#ctx.fillStyle = "#ffffff";

        this.#ctx.font = this.#fonts.scoresTableTitle;
        this.#ctx.textAlign = "center";
        this.#ctx.fillText("🏆 Score table", offsetX + tableWidth / 2, offsetY + 15);

        this.#ctx.font = this.#fonts.scoresTableRows;
        for (let i = 0; i < Math.min(topScores.length, 15); i++) {
            const entry = topScores[i];
            const name = entry.name;
            const score = entry.score;

            const yPos = offsetY+15 + rowHeight * (i + 1);

            this.#ctx.textAlign = "left";
            this.#ctx.fillText(`${i + 1}. ${name}`, offsetX, yPos);

            this.#ctx.textAlign = "right";
            this.#ctx.fillText(score, offsetX + tableWidth, yPos);
        }

        this.#ctx.restore();
    }

    renderGameOver(player){
        const overlay = document.getElementById("gameOverOverlay");
        const finalScore = document.getElementById("finalScore");
        const finalLines = document.getElementById("finalLines");

        finalScore.textContent = `Score: ${player.score}`;
        finalLines.textContent = `Lines: ${player.lines}`;
        overlay.classList.remove("hidden");
    }
    triggerShakeY() {
        this.#canvas.classList.remove("shake-y");
        void this.#canvas.offsetWidth;
        this.#canvas.classList.add("shake-y");
    }

}