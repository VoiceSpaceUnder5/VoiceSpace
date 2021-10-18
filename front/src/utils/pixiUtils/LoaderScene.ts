import {Container, Loader} from 'pixi.js';
import {assets} from './assets_meta';
import {ResourceManager} from './ResourceManager';
import {Scene} from './Scene';

const resourceUrls = [
  './assets/spaceMain/spritesheet/stuffs.json',
  './assets/spaceMain/spritesheet/avatars.json',
  // './assets/background.json',
];

export class LoaderScene extends Container implements Scene {
  constructor(afterLoad: Loader.OnCompleteSignal) {
    super();

    Loader.shared.add(assets);
    resourceUrls.forEach(resourceUrl => {
      ResourceManager.add(resourceUrl);
    });
    Loader.shared.onProgress.add(this.downloadProgress, this);
    Loader.shared.onError.add(error => {
      console.log(error);
    }, this);
    Loader.shared.onComplete.add(this.gameLoaded, this);
    Loader.shared.load(afterLoad);
  }

  private downloadProgress(loader: Loader): void {
    console.log(loader.progress);
  }

  private gameLoaded(): void {
    console.log('Loaded finished!');
  }

  public update(): void {
    return;
  }
  public resize(): void {
    return;
  }
}
