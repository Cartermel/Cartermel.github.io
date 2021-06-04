let scrollSpeed = 10;
let cnv;
let camera;

let inputs = {
	"KeyW": false,
	"KeyS": false,
	"KeyA": false,
	"KeyD": false
};

function setup() {
	cnv = createCanvas(1000, 500);
	cnv.parent('container');

	background(255);
	stroke(0);
	strokeWeight(50);
}
let x = 0;

function draw() {
	if (mouseIsPressed) {
		if (mouseButton === LEFT) {
			line(mouseX, mouseY, pmouseX, pmouseY);

		}
		if (mouseButton === CENTER) {

		}
	}
	translate(mouseX,mouseY);

}

function changeColor(r, g, b) {
	stroke(r, g, b);
}


function scroll() {
	if (inputs["KeyA"]) window.scrollTo(window.scrollX - scrollSpeed, window.scrollY);
	if (inputs["KeyD"]) window.scrollTo(window.scrollX + scrollSpeed, window.scrollY);;
	if (inputs["KeyW"]) window.scrollTo(window.scrollX, window.scrollY - scrollSpeed);;
	if (inputs["KeyS"]) window.scrollTo(window.scrollX, window.scrollY + scrollSpeed);;
}

window.onkeydown = keyDown;
window.onkeyup = keyUp;
window.onmousedown = (e) => { if (e.which === 2) e.preventDefault(); }

document.onkeydown = () => {
	changeColor(Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256));
}

function keyDown(event) { if (event.code in inputs) inputs[event.code] = true; }
function keyUp(event) { if (event.code in inputs) inputs[event.code] = false; }

// Function that returns a Promise for the FPS
const getFPS = () =>
	new Promise(resolve =>
		requestAnimationFrame(t1 =>
			requestAnimationFrame(t2 => resolve(1000 / (t2 - t1)))
		)
	)

// Calling the function to get the FPS
getFPS().then(fps => setInterval(scroll, 1000 / fps));