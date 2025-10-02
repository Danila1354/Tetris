export default class ScoreStorage {
    constructor(key = "tetris_scores") {
        this.key = key;
    }

    getScores() {
        const data = localStorage.getItem(this.key);
        return data ? JSON.parse(data) : [];
    }

    saveScore(name, score) {
        const scores = this.getScores();

        const existing = scores.find(s => s.name === name);

        if (existing) {
            if (score > existing.score) {
                existing.score = score;
            }
        } else {
            scores.push({ name, score });
        }

        scores.sort((a, b) => b.score - a.score);

        localStorage.setItem(this.key, JSON.stringify(scores));
    }



    clear() {
        localStorage.removeItem(this.key);
    }
}