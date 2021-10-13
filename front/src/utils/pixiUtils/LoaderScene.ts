import { Container, Graphics, Loader } from "pixi.js";
import { assets } from "../static/assets";
import { Scene } from "./Scene";

export class LoaderScene extends Container implements Scene {
  // for making our loader graphics...
  private loaderBar: Container;
  private loaderBarBoder: Graphics;
  private loaderBarFill: Graphics;

  constructor(afterLoad: Loader.OnCompleteSignal) {
    super();

    const screenWidth: number = Math.max(
      document.documentElement.clientWidth,
      window.innerWidth || 0
    );
    const screenHeight: number = Math.max(
      document.documentElement.clientWidth,
      window.innerWidth || 0
    );
    // lets make a loader graphic:
    const loaderBarWidth = screenWidth * 0.8; // just an auxiliar variable
    // the fill of the bar.
    this.loaderBarFill = new Graphics();
    this.loaderBarFill.beginFill(0x008800, 1);
    this.loaderBarFill.drawRect(0, 0, loaderBarWidth, 50);
    this.loaderBarFill.endFill();
    this.loaderBarFill.scale.x = 0; // we draw the filled bar and with scale we set the %

    // The border of the bar.
    this.loaderBarBoder = new Graphics();
    this.loaderBarBoder.lineStyle(10, 0x0, 1);
    this.loaderBarBoder.drawRect(0, 0, loaderBarWidth, 50);

    // Now we keep the border and the fill in a container so we can move them together.
    this.loaderBar = new Container();
    this.loaderBar.addChild(this.loaderBarFill);
    this.loaderBar.addChild(this.loaderBarBoder);
    //Looks complex but this just centers the bar on screen.
    this.loaderBar.position.x = (screenWidth - this.loaderBar.width) / 2;
    this.loaderBar.position.y = (screenHeight - this.loaderBar.height) / 2;
    this.addChild(this.loaderBar);

    // Now the actual asset loader:

    // we add the asset manifest
    Loader.shared.add(assets);

    // connect the events
    Loader.shared.onProgress.add(this.downloadProgress, this);
    Loader.shared.onComplete.add(this.gameLoaded, this);

    // Start loading!
    Loader.shared.load(afterLoad);
  }

  private downloadProgress(loader: Loader): void {
    // Progress goes from 0 to 100 but we are going to use 0 to 1 to set it to scale
    const progressRatio = loader.progress / 100;
    console.log(loader.progress);
    this.loaderBarFill.scale.x = progressRatio;
  }

  private gameLoaded(): void {
    // Our game finished loading!

    // Let's remove our loading bar
    this.removeChild(this.loaderBar);

    // all your assets are ready! I would probably change to another scene
    // ...but you could build your entire game here if you want
    // (pls don't)
    console.log("Loaded finished!");
  }

  public update() {}
  public resize() {}
}
