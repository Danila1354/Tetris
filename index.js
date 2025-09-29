import Renderer from "./js/Renderer.js";
import GameField from "./js/GameField.js";
import Game from "./js/Game.js";
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









// function playHardDrop() {
//     if (!hardDropBuffer) return;
//     const source = audioCtx.createBufferSource();
//     source.buffer = hardDropBuffer;
//     source.connect(audioCtx.destination);
//     source.start(0);
// }
//
//
// const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
// let hardDropBuffer = null;
//
// async function loadSound(url) {
//     const response = await fetch(url);
//     const arrayBuffer = await response.arrayBuffer();
//     return audioCtx.decodeAudioData(arrayBuffer);
// }
//
// // Загружаем звук при старте игры
// loadSound("harddrop.mp3").then(buffer => {
//     hardDropBuffer = buffer;
// });
const ctx = initCanvas();
const r = new Renderer(ctx)
const field = new GameField(10, 22, 30)
let g = new Game(field, r)
g.start();