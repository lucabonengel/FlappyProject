// import Neuroevolution class, which is the only one used explicitly in this file
import {Neuroevolution} from './neuroevolution';
import {QLearning} from './q-learning';

// import jquery and initialize $
import $ from 'jquery';
window.jQuery = window.$ = $;

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

// textual output in tabular form - faster than running animations
const algorithm = "q-learning";
const textualOutput = false;
const nGenerations = 30;

// The top n highest scoring genomes are printed in sorted order 
const nHighestScoresToPrint = 12;
// We go upto this score and see how many generations it takes to reach this
const metricHighestScore = 100000;

// We need to discretize the inputs for the qtable to have a feasible size
const discretizationFactor = 100;

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

const canvasHeight = 500;
const canvasWidth = 500;

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
			$("#table-generations").append(`<tr><td>${this.generation}</td><td>${this.maxScore}</td><td>${nHighest}</td></tr>`);
		}

		this.population = neuroEvol.nextGeneration();
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
				var nextObstacle = this.pipes[i].bottom / canvasHeight;
				break;
			}
		}

		// For each bird that is still alive, we decide if we flap or not
		for (var i = 0; i < this.birds.length; i++) {
			if (this.birds[i].alive) {

				var inputs = [this.birds[i].y / canvasHeight, nextObstacle]; // Inputs for the learning algorithm: next obstacle height and bird height

				var tmp = this.population[i].compute(inputs);
				if (tmp > 0.5) {
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
	constructor() {
		this.pipes;
		this.birds;
		this.living;
		this.score;
		this.maxScore = 0;
		this.intervalCount;
		this.iteration = 0;
		this.backgroundPosition = 0;
		this.qLearning = new QLearning();
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
	}

	update() {
		// Get the next obstacle
		for (var i = 0; i < this.pipes.length; i += 2) { // 2 because there is always a bottom and a top pipe
			if (this.pipes[i].x + (this.pipes[i].width) > this.birds[0].x) {
				var nextObstacle = Math.round(this.pipes[i].bottom*discretizationFactor/canvasHeight);
				break;
			}
		}

		// For each bird that is still alive, we decide if we flap or not
		for (var i = 0; i < this.birds.length; i++) {
			if (this.birds[i].alive) {

				var inputs = [Math.round(this.birds[i].y*discretizationFactor/canvasHeight), nextObstacle]; // Inputs for the learning algorithm: next obstacle height and bird height

				var tmp = this.qLearning.getAction(inputs, 1);
				if (tmp === 1) {
					this.birds[i].flap();
				}

				this.birds[i].fall();

				for (var j = 0; j < this.pipes.length; j += 2) { // 2 because there is always a bottom and a top pipe
					if (this.pipes[j].x + (this.pipes[j].width / 2) > this.birds[0].x) {
						var nextObstacleAfter = Math.round(this.pipes[j].bottom*discretizationFactor/canvasHeight);
						break;
					}
				}

				var new_inputs = [Math.round(this.birds[i].y*discretizationFactor/canvasHeight), nextObstacleAfter]
				
				if (this.birds[i].isDead(this.pipes)) {
					this.birds[i].alive = false;
					this.living--;

					this.qLearning.update(inputs, 1, tmp, new_inputs, 0);

					if (this.isEnd()) {
						// If all birds are dead, we start again with the next population
						this.start();
					}
				} else {
					this.qLearning.update(inputs, 1, tmp, new_inputs, 1);
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
		Generation.textContent = this.iteration;
		Alive.textContent = this.living + "/" + 1;

		// Recursion
		var self = this;
		requestAnimationFrame(function() {self.display();});
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
				launchGame();
			}
		}
	}
}


function launchGame() {
	if (algorithm.localeCompare("neuroevolution") === 0) {
		neuroEvol = new Neuroevolution({
			population: 50,
			network: [2, [2], 1],
		});
		game = new Game();
		game.start();
		if (!textualOutput) {
			game.update();
		} else {
			// update until metricHighestScore is reached
			while (game.maxScore < metricHighestScore) {
				game.update();
			}
			const nHighest = neuroEvol.getHighestScores(nHighestScoresToPrint).join(', ');
			if (textualOutput) {
				$("#table-generations").append(`<tr><td>${game.generation}</td><td>${game.maxScore}</td><td>${nHighest}</td></tr>`);
			}
		}

		if (!textualOutput) {
			game.display();
		}
	} else if (algorithm.localeCompare("q-learning") === 0) {
		game = new GameQLearning();
		game.start();
		game.update();
		game.display();
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
