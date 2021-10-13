import { LoaderScene } from "./LoaderScene";
import { Manager } from "./SceneManager";
import { Viewport } from "pixi-viewport";
import { Loader } from "@pixi/loaders";
import { Sprite } from "@pixi/sprite";
import { GameScene } from "./GameScene";

Manager.initialize(0x55ff77);
const loaderScene = new LoaderScene(start);
Manager.changeScene(loaderScene);

const resources = Loader.shared.resources;

function start() {
  // activate plugins
  const gameScene = new GameScene();

  // add the viewport to the stage
  Manager.changeScene(gameScene);
}
