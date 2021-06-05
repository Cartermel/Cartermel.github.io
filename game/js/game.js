// module aliases
var Engine = Matter.Engine,
    //Render = Matter.Render,  using p5js as renderer
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite;

let engine = Engine.create();
let world = engine.world;
let runner = Runner.create();
let boxes = [];
let ground;

function setup() {
    createCanvas(800, 500);
    Runner.run(runner, engine);

    let groundOptions = {
        isStatic: true
    };
    ground = Bodies.rectangle(width/2, height, width, 20, groundOptions);
    Composite.add(world, ground);
}

function draw() {
    background(51);
    //rect(box1.position.x, box1.position.y, 80, 80);
    for (let i = 0; i < boxes.length; i++) {
        boxes[i].show();
    }
    stroke(10);
    rectMode(CENTER)
    rect(width/2, height, width, 20);
}

function mouseDragged() {
    boxes.push(new customEntity(mouseX, mouseY, 10, 10));
}


function customEntity(x, y, w, h) {
    let options = {
        friction: 1,
        restitution: 0
    };
    this.body = Bodies.rectangle(x, y, w, h, options);
    this.w = w;
    this.h = h;
    Composite.add(world, this.body);

    this.show = () => {
        let pos = this.body.position;
        let angle = this.body.angle;

        push();//p5 js method... not what you think. I was very confused also, starts a new drawing state.
        translate(pos.x, pos.y)
        rotate(angle);
        rectMode(CENTER);//p5 draws rectangles at topleft corner, matterjs draws in center for physics
        strokeWeight(1);
        stroke(255);
        fill(127);
        rect(0, 0, this.w, this.h)
        pop(); //restore original state. (not exactly sure why I need these but it doesn't work without them)

    }
}