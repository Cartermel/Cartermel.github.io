//Minesweeper in javascript!
//Author: Carter Melnychuk, 2020/21
//---------------------------------------------------------------------
//------------------------VERSION 1.0----------------------------------
//---------------------------------------------------------------------
//feel free to use this code for whatever you want! (it's super messy!)
//and not commented at all...! So good luck!
//This version works... 90% of the time!
//I've given up fixing it because I got bored.
//but it is playable!

var grid = document.getElementById("grid");
var testMode = false; //Turn this variable to true to see where the mines are
let $width = 20//window.innerHeight /16;
let $height = 40//window.innerWidth /16;
let totalTiles = $width * $height;
let totalMines = 160;
let map = [];
let mineList = [];
let mineSet = new Set();//used to make sure no duplicate mines (??? SLIGHTLY WORKS?)
let game_over = false;
let flagCount = 0;
let winScreen = document.getElementById('windiv');
let ngBtn = document.getElementById('newGameBtn');
let flagUI = document.getElementById('flag-ui');
let timer = document.getElementById('timer');
let mouseX = 0;
let mouseY = 0;
let allowedFlags = totalMines;
setFlagUI();
let firstClick = true;
let difficulty = "hard";
let seconds = 0;
let start;
let socket;

createMap();
grid.addEventListener('contextmenu', event => event.preventDefault());

window.addEventListener("keydown", (event) => {
    if (game_over) return;
    if (event.key == 'r') {
        updateGrid();
    }
}, true);

function setFlagUI() {
    var flagText = allowedFlags - flagCount + "";
    if (flagText.length == 2) flagText = "0" + flagText;
    if (flagText.length == 1) flagText = "00" + flagText;
    flagUI.innerHTML = flagText;
}

function updateGrid() {
    //THIS WORKS IF YOU SET DIFFICULTY AND TOTAL MINES
    //IF NOT THE NUMBER OF MINES GETS REDUCED OVER AND OVER FOR SOME REASON???
    //so if you want to fix it there you go :)
    clearInterval(start);
    timer.innerHTML = "000";
    firstClick = true;
    ngBtn.style.backgroundImage = `url('res/gameGoing.png')`;
    allowedFlags = totalMines;
    winScreen.style.display = "none";
    flagCount = 0;
    setFlagUI();
    game_over = false;
    console.clear();
    mineList = [];
    map = [];
    mineSet.clear();
    totalTiles = $width * $height;
    createMap();
}

function createMap() {
    mineList = [];
    grid.innerHTML = "";
    for (let y = 0; y < $width; y++) {
        map[y] = [];
        row = grid.insertRow(y);
        for (let x = 0; x < $height; x++) {
            map[y][x] = 0;
            cell = row.insertCell(x);
            cell.oncontextmenu = function () { flag(this); };
            cell.onclick = function () { clickCell(this); };
            cell.onmousedown = function () {
                if (game_over) return;
                ngBtn.style.backgroundImage = `url('res/MDownTile.png')`;
            };
            var flagged = document.createAttribute("flagged");
            flagged.value = "false";
            cell.setAttributeNode(flagged);
        }
    }
    addMines();
    addMineCount();
}

function flag(cell) {
    if (game_over) return;
    ngBtn.style.backgroundImage = `url('res/gameGoing.png')`;
    var r = cell.parentNode.rowIndex;
    var c = cell.cellIndex;
    if (map[r][c] == 11) return;
    if (cell.getAttribute("flagged") == "true") {
        flagCount--;
        cell.setAttribute("flagged", "false");
        cell.className = "";
        map[r][c] -= 100;//for checking if it's flagged in the sweep method lol, it works!
    }
    else if (flagCount > allowedFlags) return;//only allow flags == mineCount
    else {
        flagCount++;
        cell.setAttribute("flagged", "true");
        cell.className = "flagged";
        map[r][c] += 100;
    }
    setFlagUI();
    checkWin(cell);
}

function addMines() {
    for (var i = 0; i < totalMines; i++) {
        var row = Math.floor(Math.random() * $width);
        var col = Math.floor(Math.random() * $height);
        map[row][col] = -1;
        if (!mineSet.has(`${row},${col}`)) {//dumb workaround lol sets dont work with arrays so
            mineList.push([row, col]);
            mineSet.add(`${row},${col}`);
        }
        //if (testMode) grid.rows[row].cells[col].innerHTML = "X";
    }
    totalMines = mineList.length;
    allowedFlags = totalMines;
    setFlagUI();
}

function addMineCount() {
    for (coord of mineList) {//loop through known mine locations, increase 8 squares around by 1
        var y = coord[0];
        var x = coord[1];
        for (r = Math.max(y - 1, 0); r < Math.min(y + 2, $width); r++) {
            for (c = Math.max(x - 1, 0); c < Math.min(x + 2, $height); c++) {
                if (map[r][c] != -1) map[r][c]++;//only increment if its not a mine
            }
        }
    }
}

function revealMines(y, x) {//reveal mines except for x,y coords, that one is red
    for (coord of mineList) {
        var row = coord[0];
        var col = coord[1];
        if (!(y == row && x == col)) grid.rows[row].cells[col].className = "mine";
    }
}

function checkWin(cell) {
    if (!(flagCount == mineList.length)) return;
    for (coord of mineList) {
        //loop through mineList check if they're all flagged
        var row = coord[0];
        var col = coord[1];
        if (grid.rows[row].cells[col].getAttribute('flagged') == 'false') return;
    }
    game_over = true;
    revealMines();
    winGame(cell);
}

function clickCell(cell) {
    if (game_over) return;//disable clicking if they won/lost
    var row = cell.parentNode.rowIndex;//get coords for map
    var col = cell.cellIndex;
    if (firstClick) {
        startTimer();
        firstClick = false;
    }
    ngBtn.style.backgroundImage = `url('res/gameGoing.png')`;
    if (cell.getAttribute("flagged") == "true") return;//dont allow flagged clicks
    if (map[row][col] == -1) {
        clearInterval(start);
        game_over = true;
        cell.className = "mineclicked";
        ngBtn.style.backgroundImage = `url('res/gameDead.png')`;
        revealMines(row, col);
        //alert("Game Over");
    }
    else {
        sweep(row, col);
        checkWin(cell);
    }
}

function sweep(row, col) {//recursive flood fill algorithm to sweep squares with 0 adjacent mines
    if (row < 0 || row > $width - 1 || col < 0 || col > $height - 1) return;//out of bounds, return
    if (map[row][col] == 11) return;//11 means swept so return
    if (map[row][col] > 90) return;
    if (map[row][col] == 0) {//empty, sweep the tile
        grid.rows[row].cells[col].className = "clicked";
        map[row][col] = 11;//set it to 11, meaning swept
        sweep(row + 1, col);//sweep all 8 surrounding tiles
        sweep(row - 1, col);
        sweep(row, col - 1);
        sweep(row, col + 1);
        sweep(row + 1, col + 1);
        sweep(row - 1, col - 1);
        sweep(row + 1, col - 1);
        sweep(row - 1, col + 1);
    }
    else if (map[row][col] > 0 && map[row][col] < 9) {//set mine numbers
        grid.rows[row].cells[col].innerHTML = map[row][col];
        grid.rows[row].cells[col].className = `clicked tile-${map[row][col]}`;
        map[row][col] = 11//same as above
    }
    else return;//i dont think it ever reaches here.. but
}

function winGame(cell) {
    clearInterval(start);
    document.getElementById('score').value = seconds;
    document.getElementById('diff').value = difficulty;
    ngBtn.style.backgroundImage = `url('res/gameWin.png') no-repeat`;
    var coord = cell.getBoundingClientRect();
    winScreen.style.display = "inline";
    var lRatio = winScreen.offsetWidth / 2 + 20;
    var tRatio = winScreen.offsetHeight / 2 + 20;
    var left = coord.left - lRatio;
    var top = coord.top - tRatio;

    //console.log(coord.left + lRatio + "?");
    //console.log(window.innerWidth);

    if (top < 0) top = 0;
    if (left < 0) left = 0;
    if (coord.left + lRatio > window.innerWidth) left -= coord.left + lRatio - window.innerWidth;
    if (coord.top + tRatio > window.innerHeight) top -= coord.top + tRatio - window.innerHeight;

    winScreen.style.left = left + "px";
    winScreen.style.top = top + "px";
}

function changeDif(i) {
    switch (i) {
        case 1:
            totalMines = 80;
            difficulty = "easy";
            break;
        case 2:
            totalMines = 120;
            difficulty = "medium";
            break;
        case 3:
            totalMines = 160;
            difficulty = "hard";
            break;
    }
    updateGrid();
}

function startTimer() {
    seconds = 0;
    incrementSeconds();
    start = setInterval(incrementSeconds, 1000);
}

function incrementSeconds() {
    seconds++;
    var _time = seconds + "";
    if (_time.length == 1) _time = "00" + _time;
    if (_time.length == 2) _time = "0" + _time;
    timer.innerHTML = _time;
}

function initHighScores() {
    //was for node.js version of site
    return;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var scores = JSON.parse(this.responseText);
            //console.log(scores);
            for(x of scores.easy){
                document.getElementById('easy-list').innerHTML+= `<li><div class="li-item"><div class="first">${x.name}</div><div class="second">${x.score}</div></div></li>`;
            }
            for(x of scores.medium){
                document.getElementById('medium-list').innerHTML+= `<li><div class="li-item"><div class="first">${x.name}</div><div class="second">${x.score}</div></div></li>`;
            }
            for(x of scores.hard){
                document.getElementById('hard-list').innerHTML+= `<li><div class="li-item"><div class="first">${x.name}</div><div class="second">${x.score}</div></div></li>`;
            }
        }
    };
    xmlhttp.open("GET", "/client/data/highscores.json", true);
    xmlhttp.send();
}
//<li><div class="li-item"><div class="first">bob billy bill</div><div class="second">12</div></div></li>