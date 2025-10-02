import ScoreStorage from "./ScoreStorage.js";

const storage = new ScoreStorage();


function renderResultsTable() {
    const tableBody = document.getElementById("scoreTableBody");
    tableBody.innerHTML = "";

    const scores = storage.getScores();

    if (scores.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="2">Нет результатов</td></tr>`;
        return;
    }

    scores.forEach((s, i) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${i + 1}</td>
            <td>${s.name}</td>
            <td>${s.score}</td>
        `;
        tableBody.appendChild(tr);
    });
}

const openLink = document.getElementById("openTableLink");
const tableOverlay = document.getElementById("tableOverlay");
const closeBtnTop = document.getElementById("closeTableBtn");

openLink.addEventListener("click", e => {
    e.preventDefault();
    renderResultsTable();
    tableOverlay.classList.remove("hidden");
});

closeBtnTop.addEventListener("click", () => {
    tableOverlay.classList.add("hidden");
});

tableOverlay.addEventListener("click", e => {
    if (e.target === tableOverlay) {
        tableOverlay.classList.add("hidden");
    }
});


