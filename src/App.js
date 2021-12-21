import Ground from './assets/images/ground.png';
import Cactus from './assets/images/cactus.png';
import DinoLose from './assets/images/dino-lose.png';
import DinoRun0 from './assets/images/dino-run-0.png';
import DinoRun1 from './assets/images/dino-run-1.png';
import DinoStationary from './assets/images/dino-stationary.png';

import './App.scss';
import React from 'react';
import { incrementCustomProperty, setCustomProperty, getCustomProperty } from './updateCustomProperty.js';

let worldElem = document.querySelector('.world');
let WORLD_WIDTH = 100;
let WORLD_HEIGHT = 30;
let groundElem = document.querySelectorAll('.ground');
let lastTime;
let speedScale;
let score; 
let SPEED_SCALE_INCREASE = 0.00001;
let scoreElement = document.querySelector('.score');
let dinoElem = document.querySelector('.dino');
let JUMP_SPEED = 0.45;
let GRAVITY = 0.0015;
let DINO_FRAME_COUNT = 2;
let FRAME_TIME = 100;
let dinoFrame;
let isJumping;
let currentFrameTime;
let yVelocity;
const SPEED = 0.05;
const CACTUS_INVERVAL_MINIMUM = 500;
const CACTUS_INTERVAL_MAXIMUM = 2000;
let nextCactusTime;


class App extends React.Component {

  state = {
    worldElem: {
      width: 0,
      height: 0
    }
  }

  componentDidMount() {
    this.setPixelToWorldScale();
    window.addEventListener('resize', this.setPixelToWorldScale);
    document.addEventListener('keydown', () => this.handleStart(), { once: true })
  }

  

  /**********************
   * Set scale of world *
   **********************/
  setPixelToWorldScale = () => {
    let worldToPixelScale;
    if (window.innerWidth / window.innerHeight < WORLD_WIDTH / WORLD_HEIGHT) {
      worldToPixelScale = window.innerWidth / WORLD_WIDTH;
    } else {
      worldToPixelScale = window.innerHeight / WORLD_HEIGHT;
    }
    this.setState({
      worldElem: {
        width: `${WORLD_WIDTH * worldToPixelScale}px`,
        height: `${WORLD_HEIGHT * worldToPixelScale}px`
      }
    })
  }

  updateWorld = (time) => {
    if (this.lastTime == null) {
      this.lastTime = time;
      window.requestAnimationFrame(this.updateWorld);
      return;
    }
    const delta = time - this.lastTime;
    
    this.updateGround(delta, speedScale);
    this.updateSpeedScale(delta);
    this.updateScore(delta);
    if (this.checkLose()) {
      return this.handleLose()
    }
    this.updateDino(delta, speedScale);
    this.updateCactus(delta, speedScale);

    this.lastTime = time;
    window.requestAnimationFrame(this.updateWorld);
    
  }

  /****************
   * Update speed *
   ****************/
  updateSpeedScale = (delta) => {
    speedScale += delta * SPEED_SCALE_INCREASE;
  }

  /****************
   * Update score *
   ****************/
  updateScore = (delta) => {
    scoreElement = document.querySelector('.score')
    score += delta * 0.01;
    scoreElement.textContent = Math.floor(score)
  }

  /***********************
   * Set ground movement *
   ***********************/

  setupGround = () => {
    groundElem = document.querySelectorAll('.ground');
    console.log(groundElem);
    setCustomProperty(groundElem[0], '--left', 0);
    setCustomProperty(groundElem[1], '--left', 300);
    }

  updateGround = (delta, speedScale) => {
    groundElem.forEach((ground) => {
      incrementCustomProperty(ground, '--left', delta * speedScale * SPEED * -1)
      if (getCustomProperty(ground, '--left') <= -300) {
        incrementCustomProperty(ground, '--left', 600)
      }
    })
  }

  /*************
   * Set cacti *
   *************/

  setupCactus = () => {
    nextCactusTime = CACTUS_INVERVAL_MINIMUM;
    document.querySelectorAll('.cactus').forEach((cactus) => {
      cactus.remove();
    })
  }

  updateCactus = (delta, speedScale) => {
    document.querySelectorAll('[data-cactus]').forEach((cactus) => {
      incrementCustomProperty(cactus, '--left', delta * speedScale * SPEED * -1)
      if (getCustomProperty(cactus, '--left') <= -100) {
        cactus.remove();
      }
    })
    if (nextCactusTime <= 0) {
      this.createCactus();
      nextCactusTime = this.randomNumberBetween(CACTUS_INVERVAL_MINIMUM, CACTUS_INTERVAL_MAXIMUM) / speedScale;
    }
    nextCactusTime -= delta;
  }

  getCactusRects = () => {
    return [...document.querySelectorAll('.cactus')].map((cactus) => {
      return cactus.getBoundingClientRect();
    })
  }

  createCactus = () => {
    worldElem = document.querySelector('.world');
    const cactus = document.createElement('img');
    cactus.dataset.cactus = true;
    cactus.src = Cactus;
    cactus.classList.add('cactus');
    setCustomProperty(cactus, '--left', 100);
    worldElem.appendChild(cactus);
  }

  randomNumberBetween = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
  

  /************
   * Set dino *
   ************/
  
  setupDino = () => {
    dinoElem = document.querySelector('.dino');
    isJumping = true;
    dinoFrame = 0;
    currentFrameTime = 0;
    yVelocity = 0;
    setCustomProperty(dinoElem, '--bottom', 0);
    document.removeEventListener('keydown', this.onJump);
    document.addEventListener('keydown', this.onJump);
  }

  updateDino = (delta, speedScale) => {
    this.handleRun(delta, speedScale);
    this.handleJump(delta);
  }

  handleRun = (delta, speedScale) => {
    dinoElem = document.querySelector('.dino');
    if (isJumping) {
      dinoElem.src = DinoStationary;
      return;
    }
    if (currentFrameTime >= FRAME_TIME) {
      dinoFrame = (dinoFrame + 1) % DINO_FRAME_COUNT;
      if (dinoFrame === 0) {
        dinoElem.src = DinoRun0;
      } else if (dinoFrame === 1) {
        dinoElem.src = DinoRun1;
      }
      
      currentFrameTime -= FRAME_TIME;
    }
    currentFrameTime += delta * speedScale
  }

  handleJump = (delta) => {
    if (!isJumping) {
      return;
    }
    incrementCustomProperty(dinoElem, '--bottom', yVelocity * delta)
    if (getCustomProperty(dinoElem, '--bottom') <= 0) {
      setCustomProperty(dinoElem, '--bottom', 0)
      isJumping = false;
    }
    yVelocity -= GRAVITY * delta;
  }

  onJump = (e) => {
    if (e.code !== 'Space' || isJumping) {
      return
    }
    yVelocity = JUMP_SPEED;
    isJumping = true;
  }

  getDinoRect = () => {
    return document.querySelector('.dino').getBoundingClientRect();
  }

  setDinoLose = () => {
    document.querySelector('.dino').src = DinoLose;
  }

  /****************
   * Handle Start *
   ****************/

   handleStart = () => {
    lastTime = null;
    speedScale = 1;
    score = 0;
    document.querySelector('.start-screen').classList.add('hide');
    this.setupGround();
    this.setupDino();
    this.setupCactus();
    window.requestAnimationFrame(this.updateWorld);
  }

  /***************
   * Handle Lose *
   ***************/
  
  checkLose = () => {
    const dinoRect = this.getDinoRect();
    return this.getCactusRects().some(rect => this.isCollision(rect, dinoRect))
  }

  isCollision = (rect1, rect2) => {
    return (rect1.left < rect2.right && rect1.top < rect2.bottom && rect1.right > rect2.left && rect1.bottom > rect2.top);
  }

  handleLose = () => {
    this.setDinoLose();
    setTimeout(() => {
      document.addEventListener('keydown', this.handleStart, { once: true })
      document.querySelector('.start-screen').classList.remove('hide')
    }, 100)
  }

  render() {
    

  return (
    <div className='world' style={this.state.worldElem}>
      <div className='score'>0</div>
      <div className='start-screen'>Press Any Key to Start</div>
      <img src={Ground} alt='ground' className='ground'></img>
      <img src={Ground} alt='ground' className='ground'></img>
      <img src={DinoStationary} alt='dinosaur' className='dino'></img>
    </div>
  );
}
}

export default App;
