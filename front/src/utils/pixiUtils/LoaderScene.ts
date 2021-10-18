import {Container, Graphics, Loader} from 'pixi.js';
import {assets} from './assets_meta';
import {Scene} from './Scene';

export class LoaderScene extends Container implements Scene {
  constructor(afterLoad: Loader.OnCompleteSignal) {
    super();

    console.log(assets);
    // connect the events
    Loader.shared.add(assets);
    Loader.shared.onProgress.add(this.downloadProgress, this);
    Loader.shared.onError.add(error => {
      console.log(error);
    }, this);
    Loader.shared.onComplete.add(this.gameLoaded, this);
    // Start loading!
    Loader.shared.load(afterLoad);
  }

  private downloadProgress(loader: Loader): void {
    console.log(loader.progress);
  }

  private gameLoaded(): void {
    console.log('Loaded finished!');
  }

  public update(framesPassed: number): void {
    return;
  }
  public resize(screenWidth: number, screenHeight: number): void {
    return;
  }
}
