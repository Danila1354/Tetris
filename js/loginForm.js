document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("username-input");

    const lastPlayer = localStorage.getItem("scores_lastPlayer");
    if (lastPlayer) {
        input.value = lastPlayer;
    }

    document.getElementById("login-form").addEventListener("submit", () => {
        localStorage.setItem("scores_lastPlayer", input.value);
    });
});