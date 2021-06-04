let scrollSpeed = 10;
let cnv;

let stateHistory = [];
let currentState;

let customCursor = document.getElementById("custom_cursor");
let container = document.getElementById("container");
let header = document.getElementById("header");
let cHeight;
let cursorOffset;
console.log(cursorOffset);

function setup() {
	cHeight = container.clientHeight;
	cnv = createCanvas(window.innerWidth, cHeight);
	cnv.parent(container);
	cnv.mouseOut(() => { customCursor.style.display = "none"; });
	cnv.mouseOver(() => { customCursor.style.display = "inline"; });

	background(255);
	stroke(0);
	strokeWeight(50);

	document.addEventListener("mousemove", e => {
		offsetX = mouseX;
		offsetY = mouseY + cursorOffset;//HEADER HEIGHT
		customCursor.style.transform = "translate(" + offsetX + "px" + "," + offsetY + "px" + ") scale(1)";
	});
	cursorOffset = header.clientHeight;
}

function draw() {
	if (mouseIsPressed) {
		if (mouseButton === LEFT) {
			line(mouseX, mouseY, pmouseX, pmouseY);
		}
	}
}

function keyPressed(e) {
	//check if ctrl z pressed and revert.
	if (e.keyCode == 90 && (e.ctrlKey || e.metaKey)) {
		undoToPrevState();
	}
}

function mousePressed() {
	//save canvas state as soon as mouse pressed
	if (mouseButton === LEFT) {
		saveState();
	}
}

function mouseReleased() {
	currentState = get();
}


function undoToPrevState() {
	background(255);
	if (stateHistory.length) {
		//draw last index of array to canvas and remove it with pop()
		image(stateHistory.pop(), 0, 0)
	}
}

function saveState() {
	stateHistory.push(get());
}

function changeColor(hex) {
	let rgb = hexToRgb(hex);
	stroke(rgb.r, rgb.g, rgb.b);
}

function hexToRgb(hex) {//from https://stackoverflow.com/a/5624139
	let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	};
}

function windowResized() {
	//header height changes on resize as it's dynamic
	//we have to reset the cursorOffset
	cursorOffset = header.clientHeight;
}