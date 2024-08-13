//board
let board;
let boardWidth = 750;
let boardHeight = 350;
let context;

//dino
let dinoWidth = 88;  //88
let dinoHeight = 94; //94
let duckWidth = 116;
let duckHeight = 60;
let dinoX = 50;
let dinoY = boardHeight - dinoHeight;
let dinoImg;
let dinoRun1Img;
let dinoRun2Img;
let dinoDuck1Img;
let dinoDuck2Img;
let dinoDeadImg;

let dino = {
    x : dinoX,
    y : dinoY,
    width : dinoWidth,
    height : dinoHeight,
    isDucking : false,
}

let currentFrame = 0;
let frameCount = 0;
let frameInterval = 15; // Change image every 15 frames

//cactus
let cactusArray = [];

let cactus1Width = 34; //34
let cactus2Width = 69; //69
let cactus3Width = 102; //102

let cactusHeight = 70; //70
let cactusX = 700;
let cactusY = boardHeight - cactusHeight;

let cactus1Img;
let cactus2Img;
let cactus3Img;

//bird
let birdArray = [];

let birdWidth = 93;

let birdHeight = 62;
let birdX = 700;
let birdY = boardHeight - dinoHeight - 50; // Slightly above the dino

let bird1Img;
let bird2Img;

//game-over and reset images
let gameOverImg;
let resetImg;

//physics
let velocityX = -4; //cactus moving left speed
let velocityY = 0;
let gravity = .25;

let gameOver = false;
let score = 0;
let gameInterval;
let placeCactusInterval;

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;

    context = board.getContext("2d"); //used for drawing on the board

    // Load dino images
    dinoRun1Img = new Image();
    dinoRun1Img.src = "/static/img/dino-run1.png";
    dinoRun2Img = new Image();
    dinoRun2Img.src = "/static/img/dino-run2.png";

    dinoDuck1Img = new Image(); // Load ducking images
    dinoDuck1Img.src = "/static/img/dino-duck1.png";
    dinoDuck2Img = new Image();
    dinoDuck2Img.src = "/static/img/dino-duck2.png";

    dinoDeadImg = new Image(); // Load dead image
    dinoDeadImg.src = "/static/img/dino-dead.png";

    // Load cactus images
    cactus1Img = new Image();
    cactus1Img.src = "/static/img/cactus1.png";

    cactus2Img = new Image();
    cactus2Img.src = "/static/img/cactus2.png";

    cactus3Img = new Image();
    cactus3Img.src = "/static/img/cactus3.png";

    // Load bird images
    bird1Img = new Image();
    bird1Img.src = "/static/img/bird1.png";
    bird2Img = new Image();
    bird2Img.src = "/static/img/bird2.png";

    // Load game-over and reset images
    gameOverImg = new Image();
    gameOverImg.src = "/static/img/game-over.png";
    resetImg = new Image();
    resetImg.src = "/static/img/reset.png";

    startGame();
}

function startGame() {
    gameInterval = requestAnimationFrame(update);
    placeCactusInterval = setInterval(placeCactus, 2000); //1000 milliseconds = 1 second
    placeBirdInterval = setInterval(placeBird, 3500); // Birds appear every 5 seconds
    document.addEventListener("keydown", moveDino);
    document.addEventListener("keyup", stopDuck);
    document.addEventListener("click", handleClick);
}

function stopGame() {
    cancelAnimationFrame(gameInterval);
    clearInterval(placeCactusInterval);
    clearInterval(placeBirdInterval);
    document.removeEventListener("keydown", moveDino);
    document.removeEventListener("keyup", stopDuck);
    document.removeEventListener("click", handleClick);
}

function update() {
    gameInterval = requestAnimationFrame(update);

    if (gameOver) {
        context.drawImage(gameOverImg, boardWidth / 2 - 193, boardHeight / 2 - 80, 386, 40);
        context.drawImage(resetImg, boardWidth / 2 - 38, boardHeight / 2, 76, 68);
        return;
    }

    context.clearRect(0, 0, board.width, board.height);

    //dino
    velocityY += gravity;
    dino.y = Math.min(dino.y + velocityY, dinoY); //apply gravity to current dino.y, making sure it doesn't exceed the ground
    
    // Animate dino
    frameCount++;
    if (frameCount % frameInterval === 0) {
        currentFrame = (currentFrame + 1) % 2; // Switch between 0 and 1
    }

    if (dino.isDucking) {
        dino.height = duckHeight; // Adjust height when ducking
        dino.y = dinoY + duckHeight / 2
        dino.width = duckWidth;
        let dinoImg = (currentFrame === 0) ? dinoDuck1Img : dinoDuck2Img;
        context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height); 
    } else {
        dino.height = dinoHeight; // Reset height when not ducking
        dino.width = dinoWidth;
        let dinoImg = (currentFrame === 0) ? dinoRun1Img : dinoRun2Img;
        context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);
    }

    // show hitbox for debug
    context.strokeStyle = 'red';
    context.strokeRect(dino.x, dino.y, dino.width, dino.height);

    //cactus
    for (let i = 0; i < cactusArray.length; i++) {
        let cactus = cactusArray[i];
        cactus.x += velocityX;
        context.drawImage(cactus.img, cactus.x, cactus.y, cactus.width, cactus.height);

        // show hitbox for debug
        context.strokeRect(cactus.x, cactus.y, cactus.width, cactus.height);

        if (detectCollision(dino, cactus)) {
            gameOver = true;
        }
    }

    //birds
    for (let i = 0; i < birdArray.length; i++) {
        let bird = birdArray[i];
        bird.x += velocityX;
        let birdImg = (frameCount % (2 * frameInterval) < frameInterval) ? bird1Img : bird2Img;
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

        if (detectCollision(dino, bird)) {
            gameOver = true;
        }
    }

    //score
    context.fillStyle = "black";
    context.font = "20px courier";
    score++;
    context.fillText(score, 5, 20);
}

function moveDino(e) {
    if (gameOver) {
        return;
    }

    if ((e.code == "Space" || e.code == "ArrowUp") && dino.y == dinoY) {
        //jump
        velocityY = -11;
    }
    else if (e.code == "ArrowDown" && dino.y == dinoY) {
        //duck
        dino.isDucking = true;
    }
}

function stopDuck(e) {
    if (e.code == "ArrowDown") {
        dino.isDucking = false; // Stop ducking
    }
}

function placeCactus() {
    if (gameOver) {
        return;
    }

    //place cactus
    let cactus = {
        img : null,
        x : cactusX,
        y : cactusY,
        width : null,
        height: cactusHeight
    }

    let placeCactusChance = Math.random(); //0 - 0.9999...

    if (placeCactusChance > .90) { //10% you get cactus3
        cactus.img = cactus3Img;
        cactus.width = cactus3Width;
        cactusArray.push(cactus);
    }
    else if (placeCactusChance > .70) { //30% you get cactus2
        cactus.img = cactus2Img;
        cactus.width = cactus2Width;
        cactusArray.push(cactus);
    }
    else { //60% you get cactus1
        cactus.img = cactus1Img;
        cactus.width = cactus1Width;
        cactusArray.push(cactus);
    }

    if (cactusArray.length > 5) {
        cactusArray.shift(); //remove the first element from the array so that the array doesn't constantly grow
    }
}

function placeBird() {
    if (gameOver) {
        return;
    }

    //place bird
    let bird = {
        x: birdX,
        y: birdY,
        width: birdWidth,
        height: birdHeight
    }

    birdArray.push(bird);

    if (birdArray.length > 5) {
        birdArray.shift(); //remove the first element from the array so that the array doesn't constantly grow
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width - 20 &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width - 20 > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height - 10 &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height - 10 > b.y;    //a's bottom left corner passes b's top left corner
}

function handleClick(e) {
    if (gameOver) {
        resetGame();
    }
}

function resetGame() {
    // Stop the game to clear intervals and event listeners
    stopGame();

    // Reset game variables
    gameOver = false;
    score = 0;
    cactusArray = [];
    birdArray = [];
    velocityY = 0;
    dino.y = dinoY;

    // Restart the game
    startGame();
}