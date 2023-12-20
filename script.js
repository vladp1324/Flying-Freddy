let context;
let boardWidth = 500;//500
let boardHeight = 720;//700

let freddyHeight = 111.83/1.15;//389
let freddyWidth = 70.4/1.15;//256
let freddyPosY = boardHeight -100;
let freddyPosX = boardWidth/2;

let platformHeight = 20;//140/70/35
let platformWidth = 90;//643/321.5/160.75
let platformPosX = boardWidth;
let platformPosY = -platformHeight;

let fallingPlatformPositionY = boardHeight - boardHeight / 8;

let platformVelocityY = 80;

//delta time
const perfectFrameTime = 1000/144;
let deltaTime = 0;
let lastTimestamp = performance.now();

let velocityX = 2.5;
let velocityY = -10;
let gravity = 0.1;

let maxJumpHeight = boardHeight / 3.8;
let platformArray = [];

let gameOver = false;
let score = 0;

let defaultPlatformSpeed = 2;
let platformSpeed = defaultPlatformSpeed;

freddyImg = new Image();
freddyImg.src = "Assets/fredy.png";
let freddy = {
    img : freddyImg,
    x : freddyPosX,
    y : freddyPosY,
    height : freddyHeight,
    width : freddyWidth
}

let keyState = {};
keyState = {
    down : {}, //true if key is down
    toggle : {}, //key up
    changed : {} // state changed
}

function keyHandler(e){
    if(keyState.down[e.code] !== (e.type === "keydown")){
        keyState.changed[e.code] = true;
    }
    keyState.down[e.code] = e.type === "keydown";
    if(e.type === "keyup"){
        keyState.toggle[e.code] = !keyState.toggle[e.code];
    }
}

let jumpAudio;
let gameOverAudio;
let gameOverAudioPlayed = false;

//setup
window.onload = function(){
    board = document.getElementById("board")
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d");

    /*const backgroundAudio = new Audio();
    backgroundAudio.src = 'https://www.youtube.com/watch?v=yNrvYeTzzv0';
    backgroundAudio.volume = 0.9;
    backgroundAudio.play();*/

    jumpAudio = new Audio("jump_sound_effect.wav");
    jumpAudio.volume = 0.1;

    gameOverAudio = new Audio("game_over.wav");
    gameOverAudio.volume = 0.3;

    generatePlatforms();
    requestAnimationFrame(update);
    document.addEventListener("keydown", keyHandler);
    document.addEventListener("keyup", keyHandler);
    //setInterval(placePlatform, 100);
}

function colision(platform){
    return freddy.x + freddy.width > platform.x &&
           platform.x + platform.width > freddy.x &&
           freddy.y + freddy.height > platform.y &&
           platform.y + platform.height- 100 > freddy.y;
}

function renderGame(){
    context.clearRect(0, 0, board.width, board.height);
    
    //draw freddy
    context.drawImage(freddyImg, freddy.x, freddy.y - cameraY, freddy.width, freddy.height);

    //draw platforms
    for(let i = 0; i < platformArray.length; i++){
        let platform = platformArray[i];
        context.drawImage(platform.img, platform.x, platform.y - cameraY, platform.width, platform.height);
    }

}

function clerPlatforms(){
    while(platformArray.length > 0 && platformArray[0].y - cameraY > boardHeight){
        platformArray.splice(0, 1);
        //score+=1;
    }
}

function changePlatformState(){
    //moving platform
    for(let i = 0; i < platformArray.length; i++){ 
        if(platformArray[i].type == 2){
            if(platformArray[i].x < platformWidth/2)
                platformArray[i].velocityX = platformSpeed;
            if(platformArray[i].x+platformWidth > boardWidth-platformWidth/2)
                platformArray[i].velocityX = -platformSpeed;
            platformArray[i].x += platformArray[i].velocityX;
        }
    }
    //trap platform
    for(let i = 0; i < platformArray.length;){
        if(platformArray[i].colided && platformArray[i].type == 3){ 
            platformArray.splice(i, 1);
        }
        else{
            i += 1;
        }
    }
}

let platformVelocityX = 0;
function checkCollision(){
    let poz = -1;
    for(let i = 0; i < platformArray.length; i++){
        if(velocityY > 0 && colision(platformArray[i])){
            velocityY = -10;
            poz = i;
            platformArray[i].colided = true;
            jumpAudio.play();
        }
        
    }
    
    for(let i = 0; i <= poz; i++){
        if(!platformArray[i].scored){
            score += 1;
            platformArray[i].scored = true;
        }
    }
    
}

function printGameOver(){
    context.fillStyle = "red";
    context.fillText("GAME OVER!", 120, 80);
}

function printRestartGame(){
    context.fillStyle = "white";
    context.font = "30px sans-serif";
    context.fillText("Press R to restart the game", 80, 110);
}

function printScore(){
    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText(score, 5, 45);
}

function changeDifficulty(){
    platformSpeed = defaultPlatformSpeed + score / 3 * 0.1;
}

//main loop
let cameraY = 0.0;
function update(timestamp){
    requestAnimationFrame(update);
    
    deltaTime = (timestamp - lastTimestamp) / perfectFrameTime;
    lastTimestamp = timestamp;

    //draw game
    renderGame();

    // if(keyState.down["ArrowUp"])
    //     cameraY -= 3.0 * deltaTime;
    // if (keyState.down["ArrowDown"])
    //     cameraY += 3.0 * deltaTime;
    
    changePlatformState();

    checkCollision();

    changeDifficulty();
    
    moveFreddy();
    //clear platforms
    clerPlatforms();

    generatePlatforms();
    //console.log(platformArray.length);
    
    printScore();
    
    if(gameOver){
        printGameOver();
        //gameOverAudio.play();
        //gameOverAudio.stop();
        printRestartGame();
    }
}

function generatePlatforms(){
    let n = 20;
    if(platformArray.length <= n){
        for(let i = 0; i < n; i++){
            placePlatform();
        }
    }
}

function placePlatform(){
    let randomPosX = platformPosX - platformWidth - Math.random() * (boardWidth - platformWidth);
    let yStart = boardHeight;
    if(platformArray.length > 0){
        yStart = platformArray[platformArray.length - 1].y;
    }
    let randomPosY = yStart - 2*platformHeight - Math.random() * maxJumpHeight;
    let typePlatform = Math.floor(Math.random()*3) + 1;
    let direction = Math.floor(Math.random()*2) + 1
    let velplatX = -platformSpeed;
    if(direction == 1)
        velplatX = platformSpeed;
    platformImg = new Image();
    switch(typePlatform){
        case 1:
            platformVelocityX = 0;
            platformImg.src = "Assets/platform.png";
            break;
        case 2:
            platformVelocityX = velplatX;
            platformImg.src = "Assets/moving_platform.png";
            break;
        case 3:
            platformVelocityX = 0;
            platformImg.src = "Assets/trap_platform.png";
            break;
        default:
            break;
    }
    let Platform = {
        img : platformImg,
        x : randomPosX,
        y : randomPosY,
        height : platformHeight,
        width : platformWidth,
        scored : false,
        type : typePlatform,
        velocityX : platformVelocityX,
        colided : false
    }
    platformArray.push(Platform);
}

function restartGame(){
    gameOver = false;
    platformArray = []
    score = 0;
    freddy.x = freddyPosX;
    freddy.y = freddyPosY;
    velocityY = -10;
    cameraY = 0.0;
    gameOverAudioPlayed = false;
    platformSpeed = defaultPlatformSpeed;
}

function moveFreddy(){
    if(gameOver && keyState.down["KeyR"]){
        restartGame();
    }
    if(keyState.down["KeyD"] || keyState.down["ArrowRight"]){
        freddy.x += velocityX * deltaTime;
    }

    if(keyState.down["KeyA"] || keyState.down["ArrowLeft"]){
        freddy.x -= velocityX * deltaTime;
    }

    if(freddy.x + freddy.width/2 < 0)
        freddy.x = boardWidth - freddy.width/2;
    if(boardWidth < freddy.x + freddy.width/2)
        freddy.x = -freddy.width/2;
    
    if(freddy.y - cameraY < maxJumpHeight){
        cameraY -= 2.5 * deltaTime;
    }
    
    velocityY += gravity * deltaTime;//aplic gravitatie
    freddy.y += velocityY * deltaTime * 0.5;

    if(freddy.y - cameraY > boardHeight){
        gameOver = true;
        if(gameOverAudioPlayed == false){
            gameOverAudio.play();
            gameOverAudioPlayed = true;
        }
    }
}