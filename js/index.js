let scrollSpeed = 10;
let cnv;

let stateHistory = [];
let currentState;

let customCursor = document.getElementById("custom_cursor");

window.onmousedown = (e) => { if (e.which === 2) e.preventDefault(); }

document.onkeydown = () => {
	changeColor(Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256));
}


function setup() {
	cnv = createCanvas(1000, 500);
	cnv.parent('container');
	cnv.mouseOut(() => { customCursor.style.display = "none"; });
	cnv.mouseOver(() => { customCursor.style.display = "inline"; });

	background(255);
	stroke(0);
	strokeWeight(50);

	document.addEventListener("mousemove", e => {
		offsetX = mouseX + 50;
		offsetY = mouseY + 50;
		customCursor.style.transform = "translate(" + offsetX + "px" + "," + offsetY + "px" + ") scale(1)";
	});
}

function draw() {
	if (mouseIsPressed) {
		if (mouseButton === LEFT) {
			line(mouseX, mouseY, pmouseX, pmouseY);
		}
		if (mouseButton === CENTER) {
			background(255);
			translate(mouseX, mouseY)
			image(currentState, 0, 0);
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

function changeColor(r, g, b) {
	stroke(r, g, b);
}