"use strict";

// Scores and generations
const CurrentScore = document.getElementById("cscore");
const HighestScore = document.getElementById("hscore");
const Generation = document.getElementById("generation");
const Alive = document.getElementById("alive");

// The canvas
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

// Characterisitics
const verticalPipeSpace = 120;
const pipeInterval = 90;
const backgroundSpeed = 0.5;
const gravity = 0.3;

// Image source
const source = {
	bird: "./img/bird.png",
	background: "./img/background.png",
	pipetop: "./img/pipetop.png",
	pipebottom: "./img/pipebottom.png"
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
		if (this.y >= canvas.height || this.y + this.height <= 0) {
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
		this.y = y; // Top left corner of the pipe we can see in the screen
		this.width = 50;
		this.bottom = bottom; // Bottom left corner of the pipe we can see in the screen
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
		if (this.living <= 0) {
			return true;
		} else {
			return false;
		}
	}

	// Start with a new generation
	start() {
		this.birds = [];
		this.pipes = [];
		this.score = 0;
		this.intervalCount = pipeInterval - 10;

		this.population = neuroEvol.generateGeneration(); // We get the networks in normal form
		for (var i = 0; i < this.population.length; i++) {
			this.birds.push(new Bird());
		}

		this.generation++;
		this.living = this.population.length;
	}

	/////////////////////////////////////////////////////////////
	///////////////////////// GAME LOOP /////////////////////////
	update() {
		// Get the next obstacle
		for (var i = 0; i < this.pipes.length; i += 2) { // 2 because there is always a bottom and a top pipe
			if (this.pipes[i].x + this.pipes[i].width > this.birds[0].x) {
				var nextObstacle = (this.pipes[i].bottom + 0.5 * verticalPipeSpace) / canvas.height;  // 0.5 * verticalPipeSpace added
				break;
			}
		}

		// For each bird that is still alive, we decide if we flap or not
		for (var i = 0; i < this.birds.length; i++) {
			if (this.birds[i].alive) {

				var inputs = [this.birds[i].y / canvas.height, nextObstacle]; // Inputs for the learning algorithm: next obstacle height and bird height

				if (this.population[i].compute(inputs) > 0.5) { // We decide if we flap or not
					this.birds[i].flap();
				}

				this.birds[i].fall();
				
				if (this.birds[i].isDead(this.pipes)) {
					this.birds[i].alive = false;
					this.living--;
					neuroEvol.networkScore(this.population[i], this.score);
					if (this.isEnd()) {
						// If all birds are dead, we start again with the next generation
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
		var currentGame = this;
		if (FPS == 0) {
			window.setZeroTimeout(function () { currentGame.update(); });
			//setZeroTimeout(function() {currentGame.update();});
		} else {
			window.setTimeout(function() {currentGame.update();}, 1000 / FPS);
		}
	}
	///////////////////////// END GAME LOOP /////////////////////////
	/////////////////////////////////////////////////////////////////


	newPipe() {
		var position = Math.round(Math.random() * (canvas.height - 2 * 50 - verticalPipeSpace)) + 50; // 50 is the minimum pipe height (top or bottom)
		this.pipes.push(new Pipe(canvas.width, 0, position));
		this.pipes.push(new Pipe(canvas.width, position + verticalPipeSpace, canvas.height));
	}


	////////////////////////////////////////////////////////////////
	///////////////////////// DISPLAY LOOP /////////////////////////
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
		Alive.textContent = this.living + "/" + neuroEvol.parameters.population;

		// Recursion
		var self = this;
		requestAnimationFrame(function() {self.display();});
	}
	///////////////////////// END DISPLAY LOOP /////////////////////////
	////////////////////////////////////////////////////////////////////
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
	neuroEvol = new Neuroevolution();
	game = new Game();
	game.start();
	game.update();
	game.display();
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


window.onload = function() {
	getImages(source);
}
