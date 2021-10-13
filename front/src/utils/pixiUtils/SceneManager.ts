import { Application } from "pixi.js";
import { DisplayObject } from "@pixi/display";
import { Scene } from "./Scene";

export class Manager {
  private constructor() {}
  private static application: Application;
  private static currentScene: Scene;

  // We no longer need to store width and height since now it is literally the size of the screen.
  // We just modify our getters
  public static get width(): number {
    return Math.max(
      document.documentElement.clientWidth,
      window.innerWidth || 0
    );
  }
  public static get height(): number {
    return Math.max(
      document.documentElement.clientHeight,
      window.innerHeight || 0
    );
  }
  public static get app(): Application {
    return Manager.application;
  }
  public static initialize(background: number): void {
    Manager.application = new Application({
      view: document.getElementById("pixi-canvas") as HTMLCanvasElement,
      resizeTo: window, // This line here handles the actual resize!
      resolution: 1,
      backgroundColor: background,
      antialias: true,
    });

    Manager.application.ticker.add(Manager.update);

    // listen for the browser telling us that the screen size changed
    window.addEventListener("resize", Manager.resize);

    console.log("Scene Manager Initialized! ");
  }

  public static changeScene(newScene: Scene): void {
    // Remove and destroy old scene... if we had one..
    if (Manager.currentScene) {
      console.log("Destroy current Scene!! ");
      Manager.application.stage.removeChild(Manager.currentScene);
      Manager.currentScene.destroy();
    }

    // Add the new one
    console.log("Add new Scene to SceneManager! ");
    Manager.currentScene = newScene;
    Manager.application.stage.addChild(Manager.currentScene);
  }

  public static resize(): void {
    // if we have a scene, we let it know that a resize happened!
    if (Manager.currentScene) {
      Manager.currentScene.resize(Manager.width, Manager.height);
    }
  }

  /* More code of your Manager.ts like `changeScene` and `update`*/
  public static update(framesPassed: number): void {
    if (Manager.currentScene) {
      Manager.currentScene.update(framesPassed);
    }
  }
}
