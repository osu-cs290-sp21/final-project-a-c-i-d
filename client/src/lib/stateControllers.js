

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
    keys: new Array(256).fill(false), // Array of 256 false values
    get upArrow   () { return Input.keys[87] | Input.keys[38] | Input.keys[32] },
    get leftArrow () { return Input.keys[65] | Input.keys[37] },
    get rightArrow() { return Input.keys[68] | Input.keys[39] },
    get downArrow () { return Input.keys[83] | Input.keys[30] },
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

