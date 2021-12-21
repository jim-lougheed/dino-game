import Ground from './assets/images/ground.png';
import Cactus from './assets/images/cactus.png';
import DinoLose from './assets/images/dino-lose.png';
import DinoRun0 from './assets/images/dino-run-0.png';
import DinoRun1 from './assets/images/dino-run-1.png';
import DinoStationary from './assets/images/dino-stationary.png';

import './App.scss';
import React from 'react';


let WORLD_WIDTH = 100;
let WORLD_HEIGHT = 30;

class App extends React.Component {

  state = {
    worldElem: {
      width: 0,
      height: 0
    }
  }

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

  lastTime;

  update = (time) => {
    if (this.lastTime == null) {
      this.lastTime = time;
      window.requestAnimationFrame(this.update);
      return;
    }
    const delta = time - this.lastTime;
    console.log(delta);

    this.lastTime = time;
    window.requestAnimationFrame(this.update);
    
  }
  
  render() {
    window.addEventListener('resize', this.setPixelToWorldScale);
    window.requestAnimationFrame(this.update);
  return (
    <div class='world' style={this.state.worldElem}>
      <div class='score'>0</div>
      <div class='start-screen hide'>Press Any Key to Start</div>
      <img src={Ground} alt='ground' class='ground'></img>
      <img src={Ground} alt='ground' class='ground'></img>
      <img src={DinoStationary} alt='dinosaur' class='dino'></img>
    </div>
  );
}
}

export default App;
