

// Sigmoid activation function
function sigmoidActivation(a) {
	return (1 / (1 + Math.exp(-a)));
}


// Returns number between -1 and 1
function randomNumber() { 
	return Math.random() * 2 - 1;
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
		this.id = index || 0;
		this.neurons = [];
	}

	// Populate the Layer with a set of randomly weighted Neurons
	// Each Neuron is initialized with nbInputs inputs with random values between -1 and 1
	populate(numberOfNeurons, InputsPerNeuron) {
		this.neurons = [];
		for (var i = 0; i < numberOfNeurons; i++) {
			var neuron = new Neuron();
			neuron.populate(InputsPerNeuron);
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
			layer.populate(hiddenLayers[i], previousLayer);
			previousLayer = hiddenLayers[i];
			this.layers.push(layer);
			index++;
		}

		var layer = new Layer(index);
		layer.populate(outputLayer, previousLayer); // Number of input is equal to the size of the last hidden layer
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
		// Iteration over the layers
		for (var i = 0; i < save.neurons.length; i++) {
			// Create and populate layers
			var layer = new Layer(index);
			layer.populate(save.neurons[i], previousNeurons);
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
				// Compute the activation of the Neuron
				this.layers[i].neurons[j].value = sigmoidActivation(sum);
			}
			previousLayer = this.layers[i];
		}

		// All outputs of the Network
		var out = [];
		var lastLayer = this.layers[this.layers.length - 1];
		for (var i in lastLayer.neurons) {
			out.push(lastLayer.neurons[i].value);
		}
		return out;
	}
}




// Genome class
// Composed of a score and a Neural Network
class Genome {
	constructor(score, network) {
		this.score = score || 0;
		this.network = network || null;
	}
}


// Generation class
// Composed of a set of Genomes
class OneGeneration {
	constructor() {
		this.genomes = [];
	}

	// Add a genome to the generation
	addGenome(genome, scoreSort) {
		// Locate position to insert Genome into.
		// The genomes should remain sorted.
		for (var i = 0; i < this.genomes.length; i++) {
			// Sort in descending order.
			if (scoreSort < 0) {
				if (genome.score > this.genomes[i].score) {
					break;
				}
				// Sort in ascending order.
			} else {
				if (genome.score < this.genomes[i].score) {
					break;
				}
			}

		}
		// Insert genome into correct position
		this.genomes.splice(i, 0, genome);
	}

	// Breed 2 genomes to produce offspring(s)
	breed(g1, g2, nbChilds, mutationRate, mutationRange) {
		var datas = [];
		for (var nb = 0; nb < nbChilds; nb++) {
			// Deep clone of genome 1
			var data = JSON.parse(JSON.stringify(g1));
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
					data.network.weights[i] += Math.random() * mutationRange * 2 - mutationRange;
				}
			}
			datas.push(data);
		}

		return datas;
	}

	// Generate the next generation
	// Return next generation data array
	generateNextGeneration(mutationRate, mutationRange, elitism, population, randomBehaviour, nbChild) {
		var nexts = [];

		for (var i = 0; i < Math.round(elitism * population); i++) {
			if (nexts.length < population) {
				// Push a deep copy of ith Genome's Nethwork
				nexts.push(JSON.parse(JSON.stringify(this.genomes[i].network)));
			}
		}

		for (var i = 0; i < Math.round(randomBehaviour *
			population); i++) {
			var n = JSON.parse(JSON.stringify(this.genomes[0].network));
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
				var childs = this.breed(this.genomes[i], this.genomes[max], (nbChild > 0 ? nbChild : 1), mutationRate, mutationRange);
				for (var c in childs) {
					nexts.push(childs[c].network);
					if (nexts.length >= population) {
						// Return once number of children is equal to the
						// population by generatino value.
						return nexts;
					}
				}
			}
			max++;
			if (max >= this.genomes.length - 1) {
				max = 0;
			}
		}
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
	nextGeneration(mutationRate, mutationRange, elitism, population, randomBehaviour, nbChild) {
		if (this.generations.length == 0) {
			// Need to create first generation.
			return false;
		}

		var gen = this.generations[this.generations.length - 1].generateNextGeneration(mutationRate, mutationRange, elitism, population, randomBehaviour, nbChild);
		this.generations.push(new OneGeneration());
		return gen;
	}

	// Add a genome to the Generations
	addGenome(genome, scoreSort) {
		// Can't add to a Generation if there are no Generations.
		if (this.generations.length > 0) {
			this.generations[this.generations.length - 1].addGenome(genome, scoreSort);
		}
	}
}




// Object of options for Neuroevolution
class Neuroevolution {
	constructor(options) {
		this.options = {
			// various factors and parameters (along with default values)
			network: [1, [1], 1],   // neural network structure
			population: 50,         // Population by generation
			elitism: 0.2,           // Best networks kepts unchanged for the next generation (rate)
			randomBehaviour: 0.2,   // New random networks for the next generation (rate)
			mutationRate: 0.1,      // Mutation rate on the weights of synapses
			mutationRange: 0.5,     // Interval of the mutation changes on the synapse weight
			historic: 0,            // Latest generations saved
			lowHistoric: false,     // Only save score (not the network)
			scoreSort: -1,          // Sort order (-1 = desc, 1 = asc)
			nbChild: 1              // Number of children by breeding
		}

		this.set(options);

		this.generationsObj = new Generations();
	}

	set(options) {
		for (var i in options) {
			if (this.options[i] != undefined) { // Only override if the passed in value is actually defined.
				this.options[i] = options[i];
			}
		}
	}

	restart() {
		this.generationsObj = new Generations();
	}

	// Create the next generation
	// Neural Network array for next Generation
	nextGeneration() {
		var networks = [];

		if (this.generationsObj.generations.length == 0) {
			// If no Generations, create first.
			networks = this.generationsObj.firstGeneration(this.options.population, this.options.network);
		} else {
			// Otherwise, create next one.
			networks = this.generationsObj.nextGeneration(this.options.mutationRate, this.options.mutationRange, this.options.elitism, this.options.population, this.options.randomBehaviour, this.options.nbChild);
		}

		// Create Networks from the current Generation.
		var nns = [];
		for (var i in networks) {
			var nn = new Network();
			nn.setSave(networks[i]);
			nns.push(nn);
		}

		if (this.options.lowHistoric) {
			// Remove old Networks.
			if (this.generationsObj.generations.length >= 2) {
				var genomes = this.generationsObj.generations[this.generationsObj.generations.length - 2].genomes;
				for (var i in genomes) {
					delete genomes[i].network;
				}
			}
		}

		if (this.options.historic != -1) {
			// Remove older generations.
			if (this.generationsObj.generations.length > this.options.historic + 1) {
				this.generationsObj.generations.splice(0, this.generationsObj.generations.length - (this.options.historic + 1));
			}
		}
		return nns;
	}

	// Adds a new Genome with specified Neural Network and score
	networkScore(network, score) {
		this.generationsObj.addGenome(new Genome(score, network.getSave()), this.options.scoreSort);
	}
}