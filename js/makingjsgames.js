var stateChanged = false;
var state = false;
var renderFuncs = {};

function makeRender(renderFunc) {
	var canvas = document.getElementById(state);
	var ctx = canvas.getContext("2d");

	var lastTime = -1;
	function elapsedTime(time) {
		var elapsed = time - lastTime;
		if (lastTime === -1) {
			elapsed = 0;
		}
		lastTime = time;
		return elapsed;
	}

	var initialState = state;
	var render = function(time) {
		if (state !== initialState) {
			return;
		}

		renderFunc(canvas, ctx, time, elapsedTime(time));
		if (state) {
			window.requestAnimationFrame(render);
		}
	}
	return render;
}

function slideChanged() {
	if (!stateChanged) {
		state = false;
		return;
	}
	stateChanged = false;

	var canvas = document.getElementById(state);
	var ctx = canvas.getContext("2d");
	var render = makeRender(renderFuncs[state]);
	window.requestAnimationFrame(render);
}

Reveal.addEventListener("slidechanged", slideChanged);

function renderSlide(id, renderFunc) {
	renderFuncs[id] = renderFunc;
	Reveal.addEventListener(id, function() {
		stateChanged = true;
		state = id;
	}, false);
}

renderSlide("canvas-render-loop", function(canvas, ctx, time) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "yellow";
	ctx.font = "60px sans-serif";
	ctx.fillText(time, 150, 150);
});

renderSlide("canvas-render-loop-elapsed", function(canvas, ctx, time, elapsed) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "yellow";
	ctx.font = "60px sans-serif";
	ctx.fillText(elapsed, 150, 150);
});

renderSlide("canvas-fps", function(canvas, ctx, time, elapsed) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "yellow";
	ctx.font = "60px sans-serif";
	var fps = Math.floor((1 / elapsed) * 1000) + " FPS";
	ctx.fillText(fps, 150, 150);
});

var animation = {
	img: new Image(),
	time: 0,
	frames: 22,
	msPerFrame: 40,
	advance: function(elapsed) {
		this.time += elapsed;
	},
	draw: function(ctx, x, y) {
		var width = this.img.width / this.frames;
		var frame = Math.floor(this.time / this.msPerFrame) % this.frames;
		var frameX = frame * width;
		ctx.drawImage(this.img,
			frameX, 0, width, this.img.height,
			x, y, width, this.img.height);
	}
};
animation.img.src = "hamster-run-right-f22.png";

var canvasAnimTimeInput = document.getElementById("canvas-animation-time");
var updateCanvasAnimTime = function() {
	animation.msPerFrame = parseInt(canvasAnimTimeInput.value);
};
canvasAnimTimeInput.addEventListener("keyup", updateCanvasAnimTime);
updateCanvasAnimTime();
renderSlide("canvas-animation", function(canvas, ctx, time, elapsed) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	animation.advance(elapsed);
	animation.draw(ctx, 260, 25);
});

var hamsterX = 200, hamsterY = 100, hamsterSpeed = .4;
var hamsterSpeedX = 0, hamsterSpeedY = 0;

var canvasKeyboardSpeedInput = document.getElementById("canvas-keyboard-speed");
var updateCanvasKeyboardSpeed = function() {
	hamsterSpeed = parseFloat(canvasKeyboardSpeedInput.value);
};
canvasKeyboardSpeedInput.addEventListener("keyup", updateCanvasKeyboardSpeed);
updateCanvasKeyboardSpeed();

var keys = {}, keyMap = { 87: 'w', 65: 'a', 83: 's', 68: 'd' };
window.addEventListener("keydown", function(e) {
	keys[keyMap[e.keyCode]] = true;
});
window.addEventListener("keyup", function(e) {
	keys[keyMap[e.keyCode]] = false;
});
renderSlide("canvas-keyboard", function(canvas, ctx, time, elapsed) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	hamsterSpeedX = 0, hamsterSpeedY = 0;
	if (keys["w"]) {
		hamsterSpeedY = -hamsterSpeed;
	}
	if (keys["a"]) {
		hamsterSpeedX = -hamsterSpeed;
	}
	if (keys["s"]) {
		hamsterSpeedY = hamsterSpeed;
	}
	if (keys["d"]) {
		hamsterSpeedX = hamsterSpeed;
	}

	hamsterX += hamsterSpeedX * elapsed;
	hamsterY += hamsterSpeedY * elapsed;

	animation.advance(elapsed);
	animation.draw(ctx, hamsterX, hamsterY);

	drawWasd(ctx);
});

function drawWasd(ctx) {
	ctx.font = "40px sans-serif";
	ctx.fillStyle = keys["w"] ? "#ff0" : "#660";
	ctx.fillText("w", 50, 50);
	ctx.fillStyle = keys["a"] ? "#ff0" : "#660";
	ctx.fillText("a", 20, 90);
	ctx.fillStyle = keys["s"] ? "#ff0" : "#660";
	ctx.fillText("s", 55, 90);
	ctx.fillStyle = keys["d"] ? "#ff0" : "#660";
	ctx.fillText("d", 85, 90);
}

renderSlide("canvas-friction", function(canvas, ctx, time, elapsed) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	hamsterSpeedY = 0;
	if (keys["w"]) {
		hamsterSpeedY = -hamsterSpeed;
	}
	if (keys["s"]) {
		hamsterSpeedY = hamsterSpeed;
	}
	hamsterY += hamsterSpeedY * elapsed;

	if (keys["a"]) {
		hamsterSpeedX = -1;
	}
	if (keys["d"]) {
		hamsterSpeedX = 1;
	}
	hamsterSpeedX *= 0.9; // friction
	hamsterX += hamsterSpeedX * elapsed;

	animation.advance(elapsed);
	animation.draw(ctx, hamsterX, hamsterY);

	drawWasd(ctx);
});

renderSlide("canvas-gravity", function(canvas, ctx, time, elapsed) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	if (keys["w"]) {
		hamsterSpeedY = -1;
	}
	hamsterSpeedY += 0.1; // gravity
	hamsterY += hamsterSpeedY * elapsed;
	if (hamsterY > 150) { // floor
		hamsterY = 150;
		hamsterSpeedY = 0;
	}

	if (keys["a"]) {
		hamsterSpeedX = -1;
	}
	if (keys["d"]) {
		hamsterSpeedX = 1;
	}
	hamsterSpeedX *= 0.9; // friction
	hamsterX += hamsterSpeedX * elapsed;

	animation.advance(elapsed);
	animation.draw(ctx, hamsterX, hamsterY);

	drawWasd(ctx);
});

var audioContext = new AudioContext();
var jumpSound;
var request = new XMLHttpRequest();
request.open("GET", "jump.mp3", true);
request.responseType = "arraybuffer";
request.addEventListener("readystatechange", function() {
	if (request.readyState !== 4) {
		return;
	}
	audioContext.decodeAudioData(request.response, function(buffer) {
		jumpSound = buffer;
	});
});
request.send();

function playSound(buffer) {
	var source = audioContext.createBufferSource();
	source.buffer = buffer;
	source.connect(audioContext.destination)
	source.start(0);
}

document.getElementById("play-sound").addEventListener("click", function() {
	playSound(jumpSound);
});
