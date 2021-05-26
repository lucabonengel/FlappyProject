// Sigmoid activation function
function sigmoidActivation(a) {
	return (1 / (1 + Math.exp(-a)));
}


// Returns number between -1 and 1
function randomNumber() {
	return 2 * Math.random() - 1;
}


// Returns a deep copy of an object
function deepCopy(object) {
	return JSON.parse(JSON.stringify(object));
}


// Artificial Neuron class
class Neuron {
	constructor() {
		this.value = 0;
		this.weights = [];
	}

	// Initialize neuron weights to random values between -1 and 1
	populate(size) {
		this.weights = [];
		for (var i = 0; i < size; i++) {
			this.weights.push(randomNumber());
		}
	}
}



// Neural Network Layer class
class Layer {
	constructor(index) { // Index of this Layer in the Network
		this.id = index;
		this.neurons;
	}

	// Populate the Layer with a set of randomly weighted Neurons
	// Each Neuron is initialized with nbInputs inputs with random values between -1 and 1
	populate(numberOfNeurons, inputsPerNeuron) {
		this.neurons = [];
		for (var i = 0; i < numberOfNeurons; i++) {
			var neuron = new Neuron();
			neuron.populate(inputsPerNeuron);
			this.neurons.push(neuron);
		}
	}
}




// Neural Network class
class Network {
	constructor() {
		this.layers = [];
	}

	// Generate the Network layers
	layerGeneration(inputLayer, hiddenLayers, outputLayer) {
		var index = 0;
		var previousLayer = 0;
		var layer = new Layer(index);
		layer.populate(inputLayer, previousLayer); // Number of inputs will be set to 0 since it is an input layer
		previousLayer = inputLayer; // Number of inputs is size of previous layer
		this.layers.push(layer);
		index++;

		for (var i = 0; i < hiddenLayers.length; i++) {
			// Repeat the same process for each hidden layer
			var layer = new Layer(index);
			layer.populate(hiddenLayers[i], previousLayer + 1); /////////////// + 1
			previousLayer = hiddenLayers[i];
			this.layers.push(layer);
			index++;
		}

		var layer = new Layer(index);
		layer.populate(outputLayer, previousLayer + 1); /////////////// + 1 // Number of input is equal to the size of the last hidden layer
		this.layers.push(layer);
	}

	// Create a copy of the Network (neurons and weights)
	// Returns number of neurons per layer and a flat array of all weights
	getSave() {
		var data = {
			neurons: [], // Number of Neurons per layer
			weights: []  // Weights of each Neuron's inputs
		};
		for (var i = 0; i < this.layers.length; i++) {
			data.neurons.push(this.layers[i].neurons.length);
			for (var j = 0; j < this.layers[i].neurons.length; j++) {
				for (var k = 0; k < this.layers[i].neurons[j].weights.length; k++) {
					// Push all input weights of each Neuron of each Layer into an array
					data.weights.push(this.layers[i].neurons[j].weights[k]);
				}
			}
		}
		return data;
	}

	// Apply network data (neurons and weights)
	// Inverse function of getSave
	setSave(save) {
		var previousNeurons = 0;
		var index = 0;
		var indexWeights = 0;
		this.layers = [];

		///////////////
		var layer = new Layer(index);
		layer.populate(save.neurons[index], previousNeurons);
		previousNeurons = save.neurons[index];
		index += 1;
		this.layers.push(layer)
		///////////////

		// Iteration over the layers
		for (var i = 1; i < save.neurons.length; i++) { ///////////////
			// Create and populate layers
			var layer = new Layer(index);
			layer.populate(save.neurons[i], previousNeurons + 1); /////////////// + 1
			for (var j = 0; j < layer.neurons.length; j++) {
				for (var k = 0; k < layer.neurons[j].weights.length; k++) {
					// Apply neurons weights to each Neuron
					layer.neurons[j].weights[k] = save.weights[indexWeights];
					indexWeights++; // Increment index of flat array
				}
			}
			previousNeurons = save.neurons[i];
			index++;
			this.layers.push(layer);
		}
	}

	// Compute the output of an input
	compute(inputs) {
		// Set the value of each Neuron in the input layer
		for (var i in inputs) {
			if (this.layers[0] && this.layers[0].neurons[i]) {
				this.layers[0].neurons[i].value = inputs[i];
			}
		}

		var previousLayer = this.layers[0]; // Previous layer is input layer
		for (var i = 1; i < this.layers.length; i++) {
			for (var j in this.layers[i].neurons) {
				// For each Neuron in each layer
				var sum = 0;
				for (var k in previousLayer.neurons) {
					// Every Neuron in the previous layer is an input to each Neuron in the next layer
					sum += previousLayer.neurons[k].value * this.layers[i].neurons[j].weights[k];
				}
				sum += this.layers[i].neurons[j].weights[previousLayer.neurons.length]; // bias term ///////////////
				// Compute the activation of the Neuron
				this.layers[i].neurons[j].value = sigmoidActivation(sum);
			}
			previousLayer = this.layers[i];
		}
		return this.layers[this.layers.length - 1].neurons[0].value;
	}
}




// Genome class
// Composed of a score and a Neural Network
class Genome {
	constructor(score, network) {
		this.score = score;
		this.network = network;
	}
}


// Generation class
// Composed of a set of Genomes
class OneGeneration {
	constructor() {
		this.genomes = [];
	}

	// Add a genome to the generation
	addGenome(genome) {
		// Locate position to insert Genome into.
		// The genomes should remain sorted.
		for (var i = 0; i < this.genomes.length; i++) {
			// Sort in descending order.
			if (genome.score > this.genomes[i].score) {
				break;
			}
		}
		// Insert genome into correct position
		this.genomes.splice(i, 0, genome);
	}

	// Breed 2 genomes to produce offspring(s)
	breed(g1, g2, mutationRate, mutationRange) {
		// Deep clone of genome 1
		var data = deepCopy(g1);
		for (var i in g2.network.weights) {
			// Genetic crossover
			// 0.5 is the crossover factor
			if (Math.random() <= 0.5) {
				data.network.weights[i] = g2.network.weights[i];
			}
		}

		// Perform mutation on some weights
		for (var i in data.network.weights) {
			if (Math.random() <= mutationRate) {
				data.network.weights[i] += randomNumber() * mutationRange;
			}
		}
		return data;
	}

	// Generate the next generation
	// Return next generation data array
	generateNextGeneration(mutationRate, mutationRange, elitism, population, randomBehaviour) {
		var nexts = [];

		for (var i = 0; i < Math.round(elitism * population); i++) {
			if (nexts.length < population) {
				// Push a deep copy of ith Genome's Nethwork
				nexts.push(deepCopy(this.genomes[i].network));
			}
		}

		for (var i = 0; i < Math.round(randomBehaviour * population); i++) {
			var n = deepCopy(this.genomes[0].network);
			for (var k in n.weights) {
				n.weights[k] = randomNumber();
			}
			if (nexts.length < population) {
				nexts.push(n);
			}
		}

		var max = 0;
		while (true) {
			for (var i = 0; i < max; i++) {
				// Create the children and push them to the nexts array.
				var child = this.breed(this.genomes[i], this.genomes[max], mutationRate, mutationRange);
				nexts.push(child.network);
				if (nexts.length >= population) {
					// Return once number of children is equal to the population by generation value.
					return nexts;
				}
			}
			max++;
			if (max >= this.genomes.length - 1) {
				max = 0;
			}
		}
	}

	getHighestScores(n) {
		const highestScores = [];
		const nHighest = Math.min(this.genomes.length, n);
		for (var i = 0; i < n; i++) {
			highestScores.push(this.genomes[i].score);
		}
		return highestScores;
	}
}





// Generations class
// Contains previous Generations and current Generation
class Generations {
	constructor() {
		this.generations = [];
	}

	// Create the first generation
	firstGeneration(population, network) {
		var out = [];
		for (var i = 0; i < population; i++) {
			// Generate the Network and save it.
			var nn = new Network();
			nn.layerGeneration(network[0], network[1], network[2]);
			out.push(nn.getSave());
		}

		this.generations.push(new OneGeneration());
		return out;
	}

	// Create the next Generation
	// Return next generation
	nextGeneration(mutationRate, mutationRange, elitism, population, randomBehaviour) {
		var gen = this.generations[this.generations.length - 1].generateNextGeneration(mutationRate, mutationRange, elitism, population, randomBehaviour);
		this.generations.push(new OneGeneration());
		return gen;
	}

	// Add a genome to the Generations
	addGenome(genome) {
		// Can't add to a Generation if there are no Generations.
		if (this.generations.length > 0) {
			this.generations[this.generations.length - 1].addGenome(genome);
		}
	}
}




// Object of parameters for Neuroevolution
export class Neuroevolution {
	constructor() {
		this.parameters = {
			// various factors and parameters (along with default values)
			network: [2, [3], 1],   // neural network structure
			population: 50,         // Population by generation
			elitism: 0.2,           // Best networks kept unchanged for the next generation (rate)
			randomBehaviour: 0.2,   // New random networks for the next generation (rate)
			mutationRate: 0.1,      // Mutation rate on the weights
			mutationRange: 0.5,     // Interval of the mutation changes on the weight
			historic: 0,            // Latest generations saved
			lowHistoric: false,     // Only save score (not the network)
		}

		this.generationsObj = new Generations();
	}


	// Create the next generation
	// Neural Network array for next Generation
	generateGeneration() {
		var networks = [];

		if (this.generationsObj.generations.length == 0) {
			// If no Generations, create first.
			networks = this.generationsObj.firstGeneration(this.parameters.population, this.parameters.network);
		} else {
			// Otherwise, create next one.
			networks = this.generationsObj.nextGeneration(this.parameters.mutationRate, this.parameters.mutationRange, this.parameters.elitism, this.parameters.population, this.parameters.randomBehaviour);
		}

		// Create Networks from the current Generation.
		var nns = [];
		for (var i in networks) {
			var nn = new Network();
			nn.setSave(networks[i]);
			nns.push(nn);
		}

		if (this.parameters.lowHistoric) {
			// Remove old Networks.
			if (this.generationsObj.generations.length >= 2) {
				var genomes = this.generationsObj.generations[this.generationsObj.generations.length - 2].genomes;
				for (var i in genomes) {
					delete genomes[i].network;
				}
			}
		}

		if (this.parameters.historic != -1) {
			// Remove older generations.
			if (this.generationsObj.generations.length > this.parameters.historic + 1) {
				this.generationsObj.generations.splice(0, this.generationsObj.generations.length - (this.parameters.historic + 1));
			}
		}
		return nns;
	}

	// Adds a new Genome with specified Neural Network and score
	networkScore(network, score) {
		this.generationsObj.addGenome(new Genome(score, network.getSave()));
	}

	getHighestScores(n) {
		if (this.generationsObj.generations.length > 0) {
			return this.generationsObj
				.generations[this.generationsObj.generations.length - 1]
				.getHighestScores(n);
		} else {
			return []
		}
	}
}
