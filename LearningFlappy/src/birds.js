// import Neuroevolution class, which is the only one used explicitly in this file
import {Neuroevolution} from './neuroevolution';
import {QLearning} from './q-learning';

// import jquery and initialize $
import $ from 'jquery';
window.jQuery = window.$ = $;

// textual output in tabular form - faster than running animations
const algorithm = "q-learning";
const textualOutput = true;
const minimalOutput = true;
const nGenerations = 30;

// The top n highest scoring genomes are printed in sorted order 
const nHighestScoresToPrint = 12;
// We go upto this score and see how many generations it takes to reach this
const metricHighestScore = 100000;

// We need to discretize the inputs for the qtable to have a feasible size
let discretizationFactor = 100.0;
// Q learning variant decides the inputs we will use for the q-learning algorithm
let qLearningVariant = 2;
// restore state to 50 iterations previously when the bird dies in the q-learning algorithm
const restoreQLearning = true;
const restoreStates = 70;

let CurrentScore;
let HighestScore;
let Generation;
let Alive;
let canvas;
let ctx;

// Scores and generations
if (textualOutput === false) {
	CurrentScore = document.getElementById("cscore");
	HighestScore = document.getElementById("hscore");
	Generation = document.getElementById("generation");
	Alive = document.getElementById("alive");

	// The canvas
	canvas = document.querySelector('canvas');
	ctx = canvas.getContext('2d');
}

// Characterisitics
const verticalPipeSpace = 120;
const pipeInterval = 90;
const backgroundSpeed = 0.5;
const gravity = 0.3;

const canvasHeight = 500.0;
const canvasWidth = 500.0;

// Image source
const source = {
	bird: require("./img/bird.png"),
	background: require("./img/background.png"),
	pipetop: require("./img/pipetop.png"),
	pipebottom: require("./img/pipebottom.png")
}


// The bird
class Bird {
	constructor() {
		this.x = 80;
		this.y = 250;
		this.width = 40;
		this.height = 30;
		this.alive = true;
		this.velocity = 0;
		this.jump = -6;
	}

	fall() {
		this.velocity += gravity;
		this.y += this.velocity;
	}

	flap() {
		this.velocity = this.jump;
	}

	isDead(pipes) {
		if (this.y >= canvasHeight || this.y + this.height <= 0) {
			return true;
		}
		for (var i = 0; i < pipes.length; i++) {
			if (this.x < pipes[i].x + pipes[i].width && pipes[i].x < this.x + this.width && this.y < pipes[i].bottom && pipes[i].y < this.y + this.height) {
				return true;
			}
		}
		return false;
	}

	serialize() {
		return {
			y: this.y,
			alive: this.alive,
			velocity: this.velocity
		}
	}

	deserialize(obj) {
		this.y = obj.y;
		this.alive = obj.alive;
		this.velocity = obj.velocity;
	}
}


// The obstacles
class Pipe {
	constructor(x, y, bottom) {
		this.x = x;
		this.y = y;
		this.width = 50;
		this.bottom = bottom;
		this.speed = 3;
	}

	update() {
		this.x -= this.speed;
	}

	isOut() {
		if (this.x + this.width < 0) {
			return true;
		}
	}

	serialize() {
		return {
			x: this.x,
			y: this.y,
			bottom: this.bottom,
		};
	}

	deserialize(obj) {
		this.x = obj.x;
		this.y = obj.y;
		this.bottom = obj.bottom;
	}
}


// Launching the game
class Game {
	constructor() {
		this.pipes;
		this.birds;
		this.living;
		this.score;
		this.maxScore = 0;
		this.intervalCount;
		this.population;
		this.generation = 0;
		this.backgroundPosition = 0;
	}

	// If all birds are dead
	isEnd() {
		for (var i = 0; i < this.birds.length; i++) {
			if (this.birds[i].alive) {
				return false;
			}
		}
		return true;
	}

	start() {
		this.birds = [];
		this.pipes = [];
		this.score = 0;
		this.intervalCount = pipeInterval - 10;

		// get the highest scores of the current generation
		const nHighest = neuroEvol.getHighestScores(nHighestScoresToPrint).join(', ');
		if (textualOutput) {
			if (!minimalOutput) {
				$("#table-generations").append(`<tr><td>${this.generation}</td><td>${this.maxScore}</td><td>${nHighest}</td></tr>`);
			}
		}

		this.population = neuroEvol.generateGeneration();
		for (var i = 0; i < this.population.length; i++) {
			this.birds.push(new Bird());
		}

		this.generation++;
		this.living = this.birds.length;
	}

	update() {
		// Get the next obstacle
		for (var i = 0; i < this.pipes.length; i += 2) { // 2 because there is always a bottom and a top pipe
			if (this.pipes[i].x + this.pipes[i].width > this.birds[0].x) {
				var nextObstacle = (this.pipes[i].bottom + 0.5 * verticalPipeSpace) / canvasHeight;
				break;
			}
		}

		// For each bird that is still alive, we decide if we flap or not
		for (var i = 0; i < this.birds.length; i++) {
			if (this.birds[i].alive) {

				var inputs = [this.birds[i].y / canvasHeight, nextObstacle]; // Inputs for the learning algorithm: next obstacle height and bird height

				if (this.population[i].compute(inputs) > 0.5) {
					this.birds[i].flap();
				}

				this.birds[i].fall();
				
				if (this.birds[i].isDead(this.pipes)) {
					this.birds[i].alive = false;
					this.living--;
					neuroEvol.networkScore(this.population[i], this.score);
					if (this.isEnd()) {
						// If all birds are dead, we start again with the next population
						this.start();
					}
				}
			}
		}

		for (var i = 0; i < this.pipes.length; i++) {
			this.pipes[i].update();
		}

		if (this.pipes.length > 0 && this.pipes[0].isOut()) {
			this.pipes.shift();
			this.pipes.shift();
		}

		this.intervalCount++;
		if (this.intervalCount == pipeInterval) {
			this.intervalCount = 0;
			this.newPipe();
		}

		this.score++;
		if (this.score > this.maxScore) {
			this.maxScore = this.score;
		}

		this.backgroundPosition += backgroundSpeed;

		// Recursion
		if (!textualOutput) {
			var currentGame = this;
			if (FPS == 0) {
				window.setZeroTimeout(function () { currentGame.update(); });
				//setZeroTimeout(function() {currentGame.update();});
			} else {
				window.setTimeout(function() {currentGame.update();}, 1000 / FPS);
			}
		}
	}


	newPipe() {
		var position = Math.round(Math.random() * (canvasHeight - 2 * 50 - verticalPipeSpace)) + 50; // 50 is the minimum pipe height (top or bottom)
		this.pipes.push(new Pipe(canvasWidth, 0, position));
		this.pipes.push(new Pipe(canvasWidth, position + verticalPipeSpace, canvasHeight));
	}


	display() {
		// We clear the canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// We draw the background
		for (var i = 0; i < Math.ceil(canvas.width / images.background.width) + 1; i++) {
			ctx.drawImage(images.background, i * images.background.width - Math.floor(this.backgroundPosition % images.background.width), 0)
		}

		// We draw the living birds
		for (var i = 0; i < this.birds.length; i++) {
			if (this.birds[i].alive) {
				ctx.save();
				ctx.translate(this.birds[i].x + this.birds[i].width / 2, this.birds[i].y + this.birds[i].height / 2); // We need this line in order to make the bird rotate
				ctx.rotate(Math.PI / 2 * this.birds[i].velocity / 20);
				ctx.drawImage(images.bird, -this.birds[i].width / 2, -this.birds[i].height / 2, this.birds[i].width, this.birds[i].height);
				ctx.restore();
			}
		}

		// We draw the pipes
		for (var i = 0; i < this.pipes.length; i++) {
			if (i % 2 == 0) { // Top pipe
				ctx.drawImage(images.pipetop, this.pipes[i].x, this.pipes[i].bottom - images.pipetop.height, this.pipes[i].width, images.pipetop.height);
			} else { // Bottom pipe
				ctx.drawImage(images.pipebottom, this.pipes[i].x, this.pipes[i].y, this.pipes[i].width, images.pipetop.height);
			}
		}

		// User interface info
		CurrentScore.textContent = this.score;
		HighestScore.textContent = this.maxScore;
		Generation.textContent = this.generation;
		Alive.textContent = this.living + "/" + neuroEvol.options.population;

		// Recursion
		var self = this;
		requestAnimationFrame(function() {self.display();});
	}
}

class GameQLearning {
	constructor(qLearning = null) {
		this.pipes;
		this.birds;
		this.living;
		this.score;
		this.maxScore = 0;
		this.intervalCount;
		this.iteration = 0;
		this.backgroundPosition = 0;

		if (qLearning) {
			this.qLearning = qLearning;
		} else {
			this.qLearning = new QLearning();
		}

		this.previousStates = [];
		this.restores = 0;
		this.updates = 0;
	}

	// If all birds are dead
	isEnd() {
		for (var i = 0; i < this.birds.length; i++) {
			if (this.birds[i].alive) {
				return false;
			}
		}
		return true;
	}

	start() {
		this.birds = [];
		this.pipes = [];
		this.score = 0;
		this.intervalCount = pipeInterval - 10;

		// get the highest scores of the current generation
		if (textualOutput) {
		}

		for (var i = 0; i < 1; i++) {
			this.birds.push(new Bird());
		}

		this.living = this.birds.length;

		this.iteration++;

	}

	update(learning = true) {
		this.updates++;

		for (var i = 0; i < this.pipes.length; i++) {
			this.pipes[i].update();
		}

		if (this.pipes.length > 0 && this.pipes[0].isOut()) {
			this.pipes.shift();
			this.pipes.shift();
		}

		this.intervalCount++;
		if (this.intervalCount == pipeInterval) {
			this.intervalCount = 0;
			this.newPipe();
		}

		// For each bird that is still alive, we decide if we flap or not
		for (var i = 0; i < this.birds.length; i++) {
			if (this.birds[i].alive) {

				var inputs = this.getQLearningInputs(i); // Inputs for the learning algorithm: next obstacle height and bird height

				var tmp = this.qLearning.getAction(inputs, 1);
				if (tmp === 1) {
					this.birds[i].flap();
				}

				this.birds[i].fall();

				var new_inputs = this.getQLearningInputs(i);
				
				if (this.birds[i].isDead(this.pipes)) {
					this.birds[i].alive = false;
					this.living--;

					if (learning) {
						this.qLearning.update(inputs, 1, tmp, new_inputs, 0);
					}

					if (this.isEnd()) {
						// If all birds are dead, we start again with the next game
						if (restoreQLearning && learning) {
							this.restoreState();
						} else {
							this.start();
						}
					}
				} else {
					if (learning) {
						this.qLearning.update(inputs, 1, tmp, new_inputs, 1);
					}
				}
			}
		}

		this.saveState();

		this.score++;
		if (this.score > this.maxScore) {
			this.maxScore = this.score;
		}

		this.backgroundPosition += backgroundSpeed;

		// Recursion
		if (!textualOutput) {
			var currentGame = this;
			if (FPS == 0) {
				window.setZeroTimeout(function () { currentGame.update(); });
				//setZeroTimeout(function() {currentGame.update();});
			} else {
				window.setTimeout(function() {currentGame.update();}, 1000 / FPS);
			}
		}
	}


	newPipe() {
		var position = Math.round(Math.random() * (canvasHeight - 2 * 50 - verticalPipeSpace)) + 50; // 50 is the minimum pipe height (top or bottom)
		this.pipes.push(new Pipe(canvasWidth, 0, position));
		this.pipes.push(new Pipe(canvasWidth, position + verticalPipeSpace, canvasHeight));
	}


	getNextPipeXY() {
		for (var i = 0; i < this.pipes.length; i += 2) { // 2 because there is always a bottom and a top pipe
			if (this.pipes[i].x + (this.pipes[i].width / 1.0) > this.birds[0].x) {
				const nextObstacleY = this.pipes[i].bottom;
				const nextObstacleX = this.pipes[i].x;
				return [nextObstacleX, nextObstacleY];
			}
		}
		return [null, null];
	}


	getQLearningInputs(i) {
		const [nextObstacleX, nextObstacleY] = this.getNextPipeXY();
		if (qLearningVariant === 1) {
			const distX = Math.round((this.birds[i].x - nextObstacleX)*discretizationFactor/canvasWidth);
			const distY = Math.round((this.birds[i].y - nextObstacleY)*discretizationFactor/canvasHeight);
			return [Math.round(this.birds[i].y*discretizationFactor/canvasHeight), distX, distY];
		} else if (qLearningVariant === 2) {
			return [Math.round(this.birds[i].y*discretizationFactor/canvasHeight), 
				Math.round(nextObstacleY*discretizationFactor/canvasHeight)];
		} else if (qLearningVariant === 3) {
			const distX = Math.round((this.birds[i].x - nextObstacleX)*discretizationFactor/canvasWidth);
			return [Math.round(this.birds[i].y*discretizationFactor/canvasHeight), 
				Math.round(nextObstacleY*discretizationFactor/canvasHeight), distX];
		}
	}


	display() {
		// We clear the canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// We draw the background
		for (var i = 0; i < Math.ceil(canvas.width / images.background.width) + 1; i++) {
			ctx.drawImage(images.background, i * images.background.width - Math.floor(this.backgroundPosition % images.background.width), 0)
		}

		// We draw the living birds
		for (var i = 0; i < this.birds.length; i++) {
			if (this.birds[i].alive) {
				ctx.save();
				ctx.translate(this.birds[i].x + this.birds[i].width / 2, this.birds[i].y + this.birds[i].height / 2); // We need this line in order to make the bird rotate
				ctx.rotate(Math.PI / 2 * this.birds[i].velocity / 20);
				ctx.drawImage(images.bird, -this.birds[i].width / 2, -this.birds[i].height / 2, this.birds[i].width, this.birds[i].height);
				ctx.restore();
			}
		}

		// We draw the pipes
		for (var i = 0; i < this.pipes.length; i++) {
			if (i % 2 == 0) { // Top pipe
				ctx.drawImage(images.pipetop, this.pipes[i].x, this.pipes[i].bottom - images.pipetop.height, this.pipes[i].width, images.pipetop.height);
			} else { // Bottom pipe
				ctx.drawImage(images.pipebottom, this.pipes[i].x, this.pipes[i].y, this.pipes[i].width, images.pipetop.height);
			}
		}

		// User interface info
		CurrentScore.textContent = this.score;
		HighestScore.textContent = this.maxScore;
		Generation.textContent = this.iteration;
		Alive.textContent = this.living + "/" + this.birds.length;

		// Recursion
		var self = this;
		requestAnimationFrame(function() {self.display();});
	}

	saveState() {
		if (!restoreQLearning) {
			return;
		}

		if (this.previousStates.length >= restoreStates) {
			this.previousStates.shift()
		}
		this.previousStates.push({
			living: this.living,
			score: this.score,
			intervalCount: this.intervalCount,
			backgroundPosition: this.backgroundPosition,
			birds: this.birds.map((bird) => (bird.serialize())),
			pipes: this.pipes.map((pipe) => (pipe.serialize())),
		});
	}

	restoreState() {
		if (!restoreQLearning) {
			return;
		}
		
		if (this.previousStates.length === 0) {
			this.start();
		} else {
			const toRestore = this.previousStates[0];
			this.living = toRestore.living;
			this.score = toRestore.score;
			this.intervalCount = toRestore.intervalCount;
			this.backgroundPosition = toRestore.backgroundPosition;

			this.birds = toRestore.birds.map((birdState) => {
				const bird = new Bird();
				bird.deserialize(birdState);
				return bird;
			});
			this.pipes = toRestore.pipes.map((pipeState) => {
				const pipe = new Pipe(pipeState.x, pipeState.y, pipeState.bottom);
				return pipe;
			})
		}

		this.restores++;
	}
}

var neuroEvol;
var maxScore = 0;
var images = {};
var game;


var FPS = 60;
function setSpeed(fps) {
	FPS = parseInt(fps);
}


function getImages(sources) {
	var loaded = 0;
	for (var i in sources) {
		images[i] = new Image();
		images[i].src = sources[i];
		images[i].onload = function () {
			loaded++;
			if (loaded == 4) {
				launchSeveralTimes();
			}
		}
	}
}




// setzeroTimeout to be faster than setTimeout
(function () {
	var timeouts = [];
	var messageName = "zero-timeout-message";

	function setZeroTimeout(fn) {
		timeouts.push(fn);
		window.postMessage(messageName, "*");
	}

	function handleMessage(event) {
		if (event.source == window && event.data == messageName) {
			event.stopPropagation();
			if (timeouts.length > 0) {
				var fn = timeouts.shift();
				fn();
			}
		}
	}

	window.addEventListener("message", handleMessage, true);

	window.setZeroTimeout = setZeroTimeout;
})();




function launchGame() {
	if (algorithm.localeCompare("neuroevolution") === 0) {
		neuroEvol = new Neuroevolution();
		game = new Game();
		game.start();
		if (!textualOutput) {
			game.update();
		} else {
			// update until metricHighestScore is reached
			while (game.maxScore < metricHighestScore) {
				game.update();
			}
		}
		const nHighest = neuroEvol.getHighestScores(nHighestScoresToPrint).join(', ');
		if (textualOutput) {
			if (!minimalOutput) {
				$("#table-generations").append(`<tr><td>${game.generation}</td><td>${game.maxScore}</td><td>${nHighest}</td></tr>`);
			}
			required_to_reach_100000.push(game.generation);
		} else {
			game.display();
		}
	} else if (algorithm.localeCompare("q-learning") === 0) {
		if (!textualOutput) {
			game = new GameQLearning();
			game.start();
			game.update();
			game.display();
		} else {
			const variantInputScores = {};
			for (qLearningVariant = 2; qLearningVariant <= 2; qLearningVariant +=1) {
				const scoresIter = [];
				game = new GameQLearning();
				game.start()
				while (game.updates < 2000000) {
					game.update();
				}
				for (let i = 0; i < 20; i++) {
					const gameTest = new GameQLearning(game.qLearning);
					gameTest.start();
					while (gameTest.iteration <= 1) {
						gameTest.update(false);
					}
					scoresIter.push(gameTest.maxScore);
				}
				variantInputScores[Math.round(qLearningVariant)] = JSON.parse(JSON.stringify(scoresIter));
			}
			console.log(JSON.stringify(variantInputScores));
			/*
			const discretizationScores = {};
			for (discretizationFactor = 10.0; discretizationFactor <= 500.0; discretizationFactor+=10) {
				const scoresIter = [];
				game = new GameQLearning();
				game.start()
				while (game.updates < 100000) {
					game.update();
				}
				for (let i = 0; i < 20; i++) {
					const gameTest = new GameQLearning(game.qLearning);
					gameTest.start();
					while (gameTest.iteration <= 1) {
						gameTest.update(false);
					}
					scoresIter.push(gameTest.maxScore);
				}
				discretizationScores[Math.round(discretizationFactor)] = JSON.parse(JSON.stringify(scoresIter));
			}
			console.log(JSON.stringify(discretizationScores));
			*/
			/*
			game = new GameQLearning();
			game.start();
			const scores = [];
			for (let i = 0; i < 10000*200; i+=10000) {
				while (game.updates < i) {
					game.update();
				}
				const scoresIter = [];
				for (let j = 0; j < 20; j++) {
					const gameTest = new GameQLearning(game.qLearning);
					gameTest.start();
					while (gameTest.iteration <= 1) {
						gameTest.update(false);
					}
					scoresIter.push(gameTest.maxScore);
				}
				scores.push(scoresIter);
			}
			console.log(JSON.stringify(scores));
			*/
		}
	}
}


window.onload = function() {
	if (!textualOutput) {
		document.getElementById("speed1x").onclick = () => {setSpeed(60)};
		document.getElementById("speed2x").onclick = () => {setSpeed(120)};
		document.getElementById("speed5x").onclick = () => {setSpeed(1000)};
		document.getElementById("speedLightspeed").onclick = () => {setSpeed(0)};
	}
	getImages(source);
}


var required_to_reach_100000 = []
function launchSeveralTimes() {
	for (var i = 0; i < 50; i++) {
		launchGame();
	}
	console.log(required_to_reach_100000);
}
