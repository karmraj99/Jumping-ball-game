const box = document.querySelector(`.box`);
const ball = document.querySelector(`.ball`);
const playingBar = document.querySelector(`.playingBar`);
const score = document.querySelector(`.scoreScreen`);
const play = document.querySelector(`.play`);
const totalScore = document.querySelector(`.totalScore`);
const soundButton = document.querySelector(".soundButton");
const soundImg = document.querySelector(`.soundImg`);
const leftButton = document.querySelector(`#leftButton`);
const rightButton = document.querySelector(`#rightButton`);

let soundOnOff = true;

const skateboardSound = document.createElement("audio");
skateboardSound.src = "sound/skateboard.mp3";

const batSound = document.createElement("audio");
batSound.src = "sound/bat.mp3";

const gameOverSound = document.createElement("audio");
gameOverSound.src = "sound/gameOver.mp3";

const ballArray = [];
ballArray.push(ball);

let boxPosition = box.getBoundingClientRect()
let ballPosition = ballArray[0].getBoundingClientRect()
let playingBarPosition = playingBar.getBoundingClientRect()

let gameOnOff = false;
let scoreNum=0;

// Ball state for each ball
const ballStates = [];

// starting ball position
let startX = box.clientWidth / 2 - ball.offsetWidth / 2;
let startY = playingBarPosition.top - boxPosition.top - ballPosition.height;

ball.style.left = startX + "px";
ball.style.top = startY + "px";

 // Initialize state for the first ball
ballStates.push({
    x: startX,
    y: startY,
    movingRight: Math.random() > 0.5,
    movingBottom: false
    });

//ball speed
let speed = 2;

// setInterval
let blockInterval;
let ballInterval;

function ballMoving(){
  ballInterval = setInterval(()=>{
    for(let ballIndex = 0; ballIndex < ballArray.length; ballIndex++){

        const ball = ballArray[ballIndex];
        const state = ballStates[ballIndex];

        let boxWidth = box.clientWidth;
        let boxHeight = box.clientHeight;
        let ballWidth = ball.offsetWidth;
        let ballHeight = ball.offsetHeight;

        // update position
        if (state.movingRight) {
              state.x += speed;
          } else {
              state.x -= speed;
            }

        if (state.movingBottom) {
              state.y += speed;
          } else {
                state.y -= speed;
              }

        // bounce logic
        if (state.x <= 0) {
              state.movingRight = true;
              state.x = 0; 
          }

        if (state.x + ballWidth >= boxWidth) {
              state.movingRight = false;
              state.x = boxWidth - ballWidth; 
          }

        if (state.y <= 0) {
              state.movingBottom = true;
              state.y = 0; 
          }

          // Check if ball hits the bottom (game over condition)
        if (state.y + ballHeight >= boxHeight) {
            ball.remove();
            ballArray.splice(ballIndex, 1);
            ballStates.splice(ballIndex, 1);
            ballIndex--; 
                        
        if (ballArray.length === 0) {
            gameOver();
          }
            continue; 
      }
        
        //checking if collision occur
        if (collisionDetection(ball, playingBar, ballIndex)) {
            state.movingBottom = false;
            if(soundOnOff){
              skateboardSound.play();
            }
            
          }

        for (let i = 0; i < numNewBlock.length; i++) {
            const newBlock = numNewBlock[i];

            if (newBlock && collisionDetection(ball, newBlock, ballIndex, i)) {
                newBlock.remove();
                numNewBlock.splice(i, 1);
                scoreNum += 1;
                if(soundOnOff){
                  batSound.play();
                }      
                if (Math.random() < 0.3) {
                      addNewBall(state.x, state.y);
                }
              }
          }

          // apply new position
          ball.style.left = state.x + "px";
          ball.style.top = state.y + "px";
      }   
}, 10);}

//starting position on playingBar and moving playerBar
let currentLeft = (box.clientWidth- ball.offsetWidth + playingBar.offsetWidth/3) / 2 + `px`; 
playingBar.style.left = currentLeft;


// key board
window.addEventListener(`keydown`, (event)=>{

  playingBarPosition = playingBar.getBoundingClientRect();

  currentLeft = playingBar.offsetLeft; 
  
  switch(event.key){
      case "ArrowLeft":
        if(!gameOnOff){
          gameOnOff = true
          ballMoving(); 
        }
        if(playingBarPosition.left - 10 <= boxPosition.left){
          break;
        }
        playingBar.style.left = currentLeft - 10 + `px`;
        break;

      case "ArrowRight":
        if(!gameOnOff){
          gameOnOff = true
          ballMoving(); 
        }
        if(playingBarPosition.right + 10 >= boxPosition.right){
          break;
        }
        playingBar.style.left = currentLeft + 10 + `px`;
  }
});

let moveInterval;

// move function
function moveBar(direction) {
  playingBarPosition = playingBar.getBoundingClientRect();
  currentLeft = playingBar.offsetLeft;

  if (!gameOnOff) {
    gameOnOff = true;
    ballMoving();
  }

  if (direction === "left" && playingBarPosition.left - 10 > boxPosition.left) {
    playingBar.style.left = currentLeft - 10 + "px";
  }

  if (direction === "right" && playingBarPosition.right + 10 < boxPosition.right) {
    playingBar.style.left = currentLeft + 10 + "px";
  }
}

// helper
function startMove(direction) {
  clearInterval(moveInterval); // avoid duplicates
  moveInterval = setInterval(() => moveBar(direction), 50);
}

function stopMove() {
  clearInterval(moveInterval);
}

// left button (mobile only)
leftButton.addEventListener("touchstart", (e) => {
  e.preventDefault(); // stop page scrolling
  startMove("left");
});
leftButton.addEventListener("touchend", stopMove);
leftButton.addEventListener("touchcancel", stopMove);

// right button (mobile only)
rightButton.addEventListener("touchstart", (e) => {
  e.preventDefault();
  startMove("right");
});
rightButton.addEventListener("touchend", stopMove);
rightButton.addEventListener("touchcancel", stopMove);



// collision detection and reflection after collision
function collisionDetection(ballElem, obj, ballIndex, blockIndex){
    const ballRect = ballElem.getBoundingClientRect();
    const objRect = obj.getBoundingClientRect();

     if (ballRect.right < objRect.left || 
        ballRect.left > objRect.right || 
        ballRect.bottom < objRect.top || 
        ballRect.top > objRect.bottom) {
        return false;
      }

    const ballCenterX = ballRect.left + ballRect.width / 2;
    const ballCenterY = ballRect.top + ballRect.height / 2;
    const objCenterX = objRect.left + objRect.width / 2;
    const objCenterY = objRect.top + objRect.height / 2;

    const dx = ballCenterX - objCenterX;
    const dy = ballCenterY - objCenterY;

    if (Math.abs(dx) > Math.abs(dy)) {
        ballStates[ballIndex].movingRight = dx > 0;
      } else {
        ballStates[ballIndex].movingBottom = dy > 0;
        }

     return true;
}



let numNewBlock = [];
blockInterval = setInterval( ()=>{
  const newBlock = document.createElement("img");
  newBlock.src = "image/bat.gif"
  newBlock.className = "newBlock";
  newBlock.style.position = "absolute";
  newBlock.style.width = "10%";

  box.appendChild(newBlock);

  let maxX = box.clientWidth - newBlock.offsetWidth;
  let maxY = (box.clientHeight / 2) - 20; 

  let randomX = Math.floor(Math.random() * maxX);
  let randomY = Math.floor(Math.random() * maxY);

  newBlock.style.left = randomX + "px";
  newBlock.style.top = randomY + "px";

  

  numNewBlock.push(newBlock);
},5000)

function gameOver(){
  clearInterval(ballInterval);
  clearInterval(blockInterval);
  if(soundOnOff){
    gameOverSound.play();
  }
  score.style.display=`block`;
  totalScore.innerText = `your score: ${scoreNum}`;
}

play.addEventListener('click', () => {
    window.location.reload();
});

//adding new ball
function addNewBall(parentBallPositionX,parentBallPositionY){

  //creating new ball
  const addBall = document.createElement("img");
  addBall.src = "image/ball.png"
  addBall.className = "ball";

  //place new ball
  box.appendChild(addBall);

  //pushing in array
  ballArray.push(addBall);

  // Initialize state for the new ball
  ballStates.push({
      x: parentBallPositionX,
      y: parentBallPositionY,
      movingRight: Math.random() > 0.5,
      movingBottom: Math.random() > 0.5
    });

  addBall.style.left = parentBallPositionX + "px";
  addBall.style.top = parentBallPositionY + "px";
}

//adding sound effect
soundButton.addEventListener("click", () => {
    if(soundOnOff){
      soundOnOff = false;
      soundImg.src = `image/sound_off.png`
    }else{
      soundOnOff = true;
      soundImg.src = `image/sound_on.png`
    }
});