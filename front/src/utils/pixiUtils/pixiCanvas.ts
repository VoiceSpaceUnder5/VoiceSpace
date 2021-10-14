import {LoaderScene} from './LoaderScene';
import {Manager} from './SceneManager';
import {GameScene} from './GameScene';

export function pixiCanvasStart(): void {
  Manager.initialize(0x55ff77);
  const loaderScene = new LoaderScene(start);
  Manager.changeScene(loaderScene);

  function start() {
    // activate plugins
    console.log('Loding finish');
    const gameScene = new GameScene();

    // add the viewport to the stage
    Manager.changeScene(gameScene);
  }
}

export function pixiCanvasDestroy(): void {
  Manager.app.destroy();
}
