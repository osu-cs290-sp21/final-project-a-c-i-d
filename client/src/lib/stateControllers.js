

// This is just a global variable for the game time.
// This method is more efficient.
export const BigBen = {
    delta: 0.0,
    start: null,
    set deltaTime(delta) {
        this.delta = delta/1000.0;
    },
    get deltaTime() {
        return this.delta;
    },
    begin() {
        this.start = new Date();
    }
};

// Global manager for the key presses.
export const Input = {
    keys: [...new Array(256)].map(e => false), // Array of 256 false values.
    get upArrow() { return Input.keys[87]; },
    get rightArrow() { return Input.keys[68]; },
    get leftArrow() { return Input.keys[65]; },
    get downArrow() { return Input.keys[83]; }
};

export const GameStats = {
    score: 0,
    scoreTime: new Date(),
    set playerScore(score) {
        if (this.score < score) {
            this.score = score;
            this.scoreTime = new Date();
        }
    },
    get playerScore() { return this.score; }
};