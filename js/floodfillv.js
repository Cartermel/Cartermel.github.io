const cvWidth = window.innerWidth;
const cvHeight = window.innerHeight;
const cellSize = 50;//px
const numCellsX = Math.ceil(cvWidth / cellSize);
const numCellsY = Math.ceil(cvHeight / cellSize);
const startingColor = 50;

let cnv;
let customCursor = document.getElementById('cursor_pos');
let cvContainer = document.getElementById('cv_container');
customCursor.style.height = cellSize - 4 + "px";
customCursor.style.width = cellSize - 6 + "px";

let cellArr = [];
let animationArr = [];

let replaceColor;
let fillColor = [255, 255, 255];

let animating = false;

let canFill = false;

let hoveredCell = { row: 0, col: 0 };

let stateHistory = {
    img: [],
    arr: []
};

document.addEventListener("keydown", (e) => {
    if (e.code == "Space") canFill = !canFill;
    if (e.code == "Escape") {
        for (cell of animationArr) {//skip animation
            rect(cell.x * cellSize, cell.y * cellSize, cellSize, cellSize);
        }
        animationArr = [];
    }
    if (e.code == "KeyC" && !animating) {
        changeColor();
    }
});

function keyPressed(e) {//move above code to here
    //check if ctrl z pressed and revert.
    if (e.keyCode == 90 && (e.ctrlKey || e.metaKey)) {
        undoToPrevState();
    }
}

function setup() {
    cnv = createCanvas(cvWidth, cvHeight);
    cnv.class('main_cv');
    cnv.parent(cvContainer);
    background(startingColor)
    noSmooth();
    for (let row = 0; row < numCellsY; row++) {
        cellArr[row] = [];
        for (let col = 0; col < numCellsX; col++) {
            cellArr[row][col] = [startingColor, startingColor, startingColor];
        }
    }
    saveState();
}

function draw() {
    animating = animationArr.length;
    if (animating) {
        fill(fillColor[0], fillColor[1], fillColor[2])
        cell = animationArr.shift();
        rect(cell.x * cellSize, cell.y * cellSize, cellSize, cellSize);
    }
}

function mouseClicked() {
    let row = parseInt(mouseY / cellSize);
    let col = parseInt(mouseX / cellSize);

    if (canFill && !animating) {
        replaceColor = cellArr[row][col];
        floodFill(row, col);
        animating = true;
    }
    else if (!animating) {
        fillCell(row, col)
    }

    if (mouseButton === LEFT) {
        saveState();
    }
}

function saveState() {
    stateHistory.img.push(get());
    stateHistory.arr.push(cellArr);
}

function undoToPrevState() {
    if (stateHistory.img.length) {
        console.log('????');
        //draw last index of array to canvas and remove it with pop()
        image(stateHistory.img.pop(), 0, 0)
        cellArr = stateHistory.arr.pop();
    }
}

function mouseDragged() {
    if (!canFill && !animating) {
        let row = parseInt(mouseY / cellSize);
        let col = parseInt(mouseX / cellSize);
        fillCell(row, col);
    }
}

cvContainer.onmousemove = () => {
    //customCursor.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    let row = parseInt(mouseY / cellSize);
    let col = parseInt(mouseX / cellSize);
    customCursor.style.top = row * cellSize + "px";
    customCursor.style.left = col * cellSize + "px";
}

function changeColor() {
    fillColor = [random(255), random(255), random(255)];
    customCursor.style.background = `rgb(${fillColor[0]},${fillColor[1]},${fillColor[2]})`;
}

function fillCell(row, col) {
    cellArr[row][col] = fillColor;
    fill(fillColor[0], fillColor[1], fillColor[2]);
    rect(col * cellSize, row * cellSize, cellSize, cellSize);
}

function floodFill(row, col) {
    if (row < 0 || row > numCellsY - 1 || col < 0 || col > numCellsX - 1) return;//check bounds
    let cellColor = cellArr[row][col];
    if (!colorsAreEqual(cellColor, replaceColor)) return;//if the current cell is not the replace color, return.
    if (colorsAreEqual(cellColor, fillColor)) return;    //if the current cell is the fill color, return.

    cellArr[row][col] = fillColor;
    animationArr.push({ x: col, y: row });
    floodFill(row + 1, col);
    floodFill(row - 1, col);
    floodFill(row, col + 1);
    floodFill(row, col - 1);
}

function colorsAreEqual(c1, c2) {
    return c1[0] == c2[0] && c1[1] == c2[1] && c1[2] == c2[2];
}