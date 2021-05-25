// Model inspired by the paper 'Applying Q-Learning to Flappy Bird'
// by Moritz Ebeling-Rump, Manfred Kao, Zachary Hervieux-Moore

// we use a map to represent a QMatrix in the Q-Learning algorithm because it is
// quite expensive to initialize a big array

// we store the value and as well as the number of times it has been accessed to
// determine the learning rate alpha

const discountFactor = 1;

class QMatrix {
    constructor() {
        this.values = {};
    }

    getValue(index) {
        const ind = JSON.stringify(index);
        if (ind in this.values) {
            return this.values[ind]["value"];
        } else {
            this.values[ind] = { value: 0.0, nReached: 0 };
            return this.values[ind]["value"];
        }
    }

    setValue(index, value) {
        const ind = JSON.stringify(index);
        if (ind in this.values) {
            this.values[ind]["value"] = value;
        } else {
            this.values[ind] = { value: value, nReached: 0 };
        }
    }

    getNReached(index) {
        const ind = JSON.stringify(index);
        if (ind in this.values) {
            return this.values[ind]["nReached"];
        } else {
            this.values[ind] = { value: 0.0, nReached: 0 };
            return this.values[ind]["nReached"];
        }
    }

    incrementNReached(index) {
        const ind = JSON.stringify(index);
        if (ind in this.values) {
            this.values[ind]["nReached"]++;
        } else {
            this.values[ind] = { value: value, nReached: 1 };
        }
    }
}

function reward(alive) {
    if (alive === 1) {
        return 0;
    }
    return -1000;
}

export class QLearning {
    constructor() {
        this.matrix = new QMatrix();
    }

    update(state, alive, action, outcomeState, outcomeAlive) {
        let index = [ state, alive, action ];

        this.matrix.incrementNReached(index);
        //let learningRate = 1.0 / (1.0 + this.matrix.getNReached(index));
        const learningRate = 0.1;

        let originalValue = this.matrix.getValue(index);
        let update =
            reward(outcomeAlive) +
            discountFactor *
                Math.max(
                    this.matrix.getValue([
                        outcomeState,
                        outcomeAlive,
                        0,
                    ]),
                    this.matrix.getValue([
                        outcomeState,
                        outcomeAlive,
                        1,
                    ])
                ) -
            originalValue;

        this.matrix.setValue(index, originalValue + learningRate * update);
    }

    getAction(state, alive) {
        if (
            this.matrix.getValue([ state, alive, 0 ]) >=
            this.matrix.getValue([ state, alive, 1 ])
        ) {
            return 0;
        }
        return 1;
    }
}
