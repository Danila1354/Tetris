import Tetromino from "./Tetromino.js";
import InputHandler from "./InputHandler.js";
import TetrominoBag from "./TetrominoBag.js";
import ExplodingBlock from "./ExplodingBlock.js";


export default class Game {
    #field;
    #renderer;
    #currentTetromino;
    #input;
    #lastDropTime;

    #dropInterval;
    #ghostTetromino;
    #tetrominoBag;
    #player;

    #startDropInterval = 800;
    #endDropInterval = 80;
    #startDelayWithoutActions = 800;
    #endDelayWithoutActions = 200;
    #lastTime = null;

    #isLocking = false;
    #lockTimer = 0;
    #lockDelayWithoutActions = 1000;

    #lastDropY = null;
    #maxLockDrops = 20;
    #lockDrops = 0;
    #pulseTime = 0;

    #explodingBlocks = [];

    #startTime = null;   // когда началась игра
    #elapsed = 0;

    constructor(field, renderer, player) {
        this.#field = field;
        this.#renderer = renderer;
        this.#player = player;
        this.#currentTetromino = null;
        this.#ghostTetromino = null;
        this.#tetrominoBag = new TetrominoBag();
        this.#input = new InputHandler();
        this.#lastDropTime = 0;
        this.#dropInterval = this.#startDropInterval;
    }

    start() {
        this.#currentTetromino = new Tetromino(this.#tetrominoBag.getNext());
        this.setCenterCoords();


        this.#lastTime = performance.now();
        this.#startTime = this.#lastTime;
        this.isRunning = true;
        this.animationId = requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }

    gameLoop(timestamp) {
        if (!this.isRunning) return;
        const delta = timestamp - this.#lastTime;
        this.#lastTime = timestamp;
        this.#elapsed = timestamp - this.#startTime;
        this.update(delta);
        this.render();

        this.animationId = requestAnimationFrame((ts) => this.gameLoop(ts));
    }

    performAction(action) {
        const actions = {
            left: () => this.tryMove(-1, 0),
            right: () => this.tryMove(1, 0),
            down: () => {
                const moved = this.tryMove(0, 1);
                if (moved) {
                    this.#player.addScore(1);
                }
                return moved;
            },
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
        this.#explodingBlocks.forEach(b => b.update(delta));
        this.#explodingBlocks = this.#explodingBlocks.filter(b => !b.isDone());

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
        } else {
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
        let countCells = 0;
        while (this.#field.checkNextPosition(tetromino, 0, 1)) {
            tetromino.moveDown();
            countCells++;
        }
        if (!isGhost) {
            // playHardDrop();
            this.lockCurrentTetromino();
            this.#player.addScore(countCells * 2);
            this.#isLocking = false;
            this.#lockTimer = 0;
            this.#lockDrops = 0;
            this.#pulseTime = 0;
        }
    }

    stopGame() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    lockCurrentTetromino() {
        this.#field.fixTetromino(this.#currentTetromino);
        if (this.#field.checkGameOver()) {
            this.stopGame();
            return;
        }
        triggerShakeY();
        const fullLines = this.#field.checkFullLines();
        if (fullLines.length) {
            fullLines.forEach(y => {
                for (let x = 0; x < this.#field.cols; x++) {
                    const cell = this.#field.getCellByIndex(x, y);
                    if (cell.isOccupied) {
                        this.#explodingBlocks.push(new ExplodingBlock(cell, this.#field.getCellColor(x, y)));
                    }
                }
            });
            this.#field.removeFullLines(fullLines);
            this.updatePlayerScore(fullLines.length);
        }
        this.#currentTetromino = new Tetromino(this.#tetrominoBag.getNext());
        this.setCenterCoords();
    }

    updatePlayerScore(linesCleared) {
        const lineScores = [0, 100, 300, 500, 800];
        this.#player.addScore(lineScores[linesCleared] * this.#player.level);

        const levelUp = this.#player.addLines(linesCleared);
        if (levelUp) {
            this.setDropInterval();
        }
    }

    getFormattedTime() {
        const time = this.#elapsed;
        const minutes = Math.floor(time / 60000);
        const seconds = Math.floor((time % 60000) / 1000);
        const millis = Math.floor((time % 1000) / 10); // сотые

        return (
            String(minutes).padStart(2, "0") + ":" +
            String(seconds).padStart(2, "0") + ":" +
            String(millis).padStart(2, "0")
        );
    }

    render() {
        this.#renderer.clear();
        this.#renderer.drawField(this.#field);
        this.#renderer.drawTetromino(this.#field.getTetrominoCells(this.#ghostTetromino), this.#ghostTetromino.colors);
        this.#renderer.drawNextTetrominoWindow(this.#field, this.#tetrominoBag.viewNext());
        if (this.#isLocking) {
            const pulse = (Math.sin(this.#pulseTime * 0.02) + 1) / 2;
            this.#renderer.saveCtxAndMakeAlpha(0.4 + 0.6 * pulse);
        }
        this.#renderer.drawTetromino(this.#field.getTetrominoCells(this.#currentTetromino), this.#currentTetromino.colors);
        this.#renderer.restoreCtx();
        this.#explodingBlocks.forEach(b => this.#renderer.drawExplodingBlock(b));
        this.#renderer.renderInfoPanel(this.#player.level,
            this.#player.score,this.getFormattedTime(), this.#player.lines,
            this.#field.startX - 200, this.#field.startY+ 60);
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
        this.#currentTetromino.coords = oldCoords;
        this.#currentTetromino.baseCoords = oldBase;
        this.#currentTetromino.orientation = oldOrientation;
        return false;
    }

    setDropInterval() {
        const nesSpeeds = [
            800, 717, 633, 550, 467, 383, 300, 217, 133, 100,
            83, 83, 83, 67, 67, 67, 50, 50, 50, 33
        ];
        const level = this.#player.level;
        this.#dropInterval = nesSpeeds[Math.min(level, nesSpeeds.length - 1)];
        this.#lockDelayWithoutActions = Math.max(this.#endDelayWithoutActions,
            this.#startDelayWithoutActions - (this.#player.level - 1) * 50);
    }
}

function triggerShakeY() {
    const canvas = document.querySelector("canvas");
    canvas.classList.remove("shake-y");
    void canvas.offsetWidth;
    canvas.classList.add("shake-y");
}