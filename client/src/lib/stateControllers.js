

// This is just a global variable for the game time
// This method is more efficient
export const BigBen = {
    delta: 0.0,
    start: null,
    begin()              { this.start = new Date() },
    set deltaTime(delta) { this.delta = delta/1000.0 },
    get deltaTime()      { return this.delta },
}


export const Input = { // Global manager for the key presses
    ks: new Array(256).fill(false), // Array of 256 false values
    get upArrow   () { return Input.ks[87] | Input.ks[38] | Input.ks[32] },
    get leftArrow () { return Input.ks[65] | Input.ks[37] },
    get rightArrow() { return Input.ks[68] | Input.ks[39] },
    get downArrow () { return Input.ks[83] | Input.ks[30] },
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
}

