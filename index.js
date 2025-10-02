import Renderer from "./js/Renderer.js";
import GameField from "./js/GameField.js";
import Game from "./js/Game.js";
import Player from "./js/Player.js";
function initCanvas() {
    const canvas = document.getElementById("canvas");
    const scale = window.devicePixelRatio || 1;

    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";

    canvas.width = window.innerWidth * scale;
    canvas.height = window.innerHeight * scale;

    const ctx = canvas.getContext("2d");
    ctx.scale(scale, scale);

    return ctx;
}

function startGame(){
    const params = new URLSearchParams(window.location.search);
    const username = params.get("username") || localStorage.getItem("scores_lastPlayer") || "Игрок";
    const ctx = initCanvas();
    const r = new Renderer(ctx)
    const field = new GameField(10, 22, 30)
    const player = new Player(username)
    let g = new Game(field, r, player)
    g.start();
}

document.getElementById("restartBtn").addEventListener("click", () => {
    document.getElementById("gameOverOverlay").classList.add("hidden");
    startGame();
});

startGame();
