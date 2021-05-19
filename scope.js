const f = function () {
    console.log(this.x);
}

f.bind({ x: 1 })()