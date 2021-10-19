import {SceneManager} from './SceneManager';
import {GameScene} from './GameScene';
import {ResourceManager} from './ResourceManager';
import resourceUrls from './metaData/resourcesUrl.json';

export function pixiCanvasStart(): void {
  SceneManager.initialize(0x552227);
  ResourceManager.loadResourcesFrom(resourceUrls);
  ResourceManager.setOnErrorCallback(error => {
    console.log(error);
  });
  ResourceManager.setOnProgressCallback(loader => {
    console.log(loader.progress);
  });
  ResourceManager.runAfterLoaded(start);

  function start() {
    const gameScene = new GameScene();
    console.log(gameScene);
    console.log('changeScene to GameScene');
    SceneManager.changeScene(gameScene);
  }
}

export function pixiCanvasDestroy(): void {
  console.log('Pixi-app destoryed!');
  SceneManager.destroy();
}
