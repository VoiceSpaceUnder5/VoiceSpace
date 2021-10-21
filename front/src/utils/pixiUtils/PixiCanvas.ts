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
  ResourceManager.setOnErrorCallback(errorCB);
  ResourceManager.setOnProgressCallback(progressCB); // 이미 로딩이 다 되어있을 경우 progressCB 이 한번도 실행되지 않습니다.
  ResourceManager.loadResourcesFrom(resourceUrls);

  const start = (): void => {
    progressCB(100); // 따라서 start 가 호출이 되면 어짜피 로딩이 다 되었다는 뜻이기 때문에 다시한번 progressCB 에 100을 넣어서 호출 하였습니다.
    const gameScene = new GameScene();
    console.log(gameScene);
    console.log('changeScene to GameScene');
    SceneManager.changeScene(gameScene);
  };

  ResourceManager.run(start);
}

export function pixiCanvasDestroy(): void {
  console.log('Pixi-app destoryed!');
  SceneManager.destroy();
}
