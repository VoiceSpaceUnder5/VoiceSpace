import {SceneManager} from './SceneManager';
import {GameScene} from './GameScene';
import {ResourceManager} from './ResourceManager';
import resourceUrls from './metaData/resourcesUrl.json';

export function pixiCanvasStart(
  canvas: HTMLCanvasElement,
  progressCB = (arg0: number) => {
    arg0;
    return;
  },
  errorCB = () => {
    return;
  },
): void {
  SceneManager.changeCanvas(canvas);
  SceneManager.initialize(0xffffff);
  ResourceManager.loadResourcesFrom(resourceUrls);
  ResourceManager.setOnErrorCallback(errorCB);
  ResourceManager.setOnProgressCallback(progressCB);
  ResourceManager.run(start);
}

function start(): void {
  const gameScene = new GameScene();
  console.log('changeScene to GameScene');
  SceneManager.changeScene(gameScene);
}

export function pixiCanvasDestroy(): void {
  console.log('Pixi-app destoryed!');
  SceneManager.destroy();
}
