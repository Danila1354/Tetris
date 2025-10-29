import Renderer from "./js/Renderer.js";
import GameField from "./js/GameField.js";
import Game from "./js/Game.js";
import Player from "./js/Player.js";
function startGame(){
    const params = new URLSearchParams(window.location.search);
    const username = params.get("username") || localStorage.getItem("scores_lastPlayer") || "Игрок";
    const r = new Renderer()
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
