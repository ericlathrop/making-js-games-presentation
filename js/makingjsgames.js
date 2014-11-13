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

	var render = function(time) {
		if (!state) {
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

var boxX = 200, boxY = 100, boxSpeed = .2;
var canvasKeyboardSpeedInput = document.getElementById("canvas-keyboard-speed");
var updateCanvasKeyboardSpeed = function() {
	boxSpeed = parseFloat(canvasKeyboardSpeedInput.value);
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

	if (keys["w"]) {
		boxY -= boxSpeed * elapsed;
	}
	if (keys["a"]) {
		boxX -= boxSpeed * elapsed;
	}
	if (keys["d"]) {
		boxX += boxSpeed * elapsed;
	}
	if (keys["s"]) {
		boxY += boxSpeed * elapsed;
	}
	ctx.fillStyle = "red";
	ctx.fillRect(boxX, boxY, 100, 100);

	ctx.font = "40px sans-serif";
	ctx.fillStyle = keys["w"] ? "#ff0" : "#660";
	ctx.fillText("w", 50, 50);
	ctx.fillStyle = keys["a"] ? "#ff0" : "#660";
	ctx.fillText("a", 20, 90);
	ctx.fillStyle = keys["s"] ? "#ff0" : "#660";
	ctx.fillText("s", 55, 90);
	ctx.fillStyle = keys["d"] ? "#ff0" : "#660";
	ctx.fillText("d", 85, 90);
});
