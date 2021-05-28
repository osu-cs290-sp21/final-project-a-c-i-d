

export class StateGraph {
    constructor() { this._state = null; }
    add(edge) {
        const [current, next]  = edge; // Directed edge
    }
    change(destination) {
        // Transitions to the next state if possible
    }
    possible(possibleDestination) {

    }
    get current() {}
}

export class TransitionGraph extends StateGraph {
    constructor() {
        super();
    }
    add(edge, {transitionRule, onChange}) {
        // transitionRule is a predicate that takes in the current state, and returns true if the transition can be made. 
        // onChange is an optional callback that is fired when the transition is made. 
    }
}