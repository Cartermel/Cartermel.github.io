let socket;
let cv;
let ctx;
const cWIDTH = 1500;
const cHEIGHT = 800;

function setup() {
	// Creating canvas
	cv = createCanvas(cWIDTH, cHEIGHT);
	cv.class('main_canvas');
	ctx = cv.elt.getContext('2d');
	ctx.imageSmoothingEnabled = false;

	// Start the socket connection
	socket = io();
}