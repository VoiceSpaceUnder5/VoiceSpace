import {LoaderScene} from './LoaderScene';
import {SceneManager} from './SceneManager';
import {GameScene} from './GameScene';

export function pixiCanvasStart(): void {
  SceneManager.initialize(0x55ff77);
  const loaderScene = new LoaderScene(start);
  SceneManager.changeScene(loaderScene);

  function start() {
    // activate plugins
    console.log('Loding finish');
    const gameScene = new GameScene();

    // add the viewport to the stage
    SceneManager.changeScene(gameScene);
  }
}

export function pixiCanvasDestroy(): void {
  SceneManager.app.destroy();
}
