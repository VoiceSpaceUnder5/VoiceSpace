import { Renderer, Sprite, Texture } from "pixi.js";
import { Viewport } from "pixi-viewport";
import { LoaderScene } from "./LoaderScene";
import { Loader } from "@pixi/loaders";
import { Manager } from "./SceneManager";
import { BaseTextureCache } from "@pixi/utils";

// or with require
// const PIXI = require('pixi.js')
// const Viewport = require('pixi-viewport').Viewport
Manager.initialize(0x001300);
// const loader = new LoaderScene(1000, 1000);
// Manager.changeScene(loader);

// create viewport
const viewport = new Viewport({
  screenWidth: window.innerWidth,
  screenHeight: window.innerHeight,
  worldWidth: 1000,
  worldHeight: 1000,

  interaction: Manager.app.renderer.plugins.interaction, // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
});
viewport.drag().pinch().wheel().decelerate();

// add the viewport to the stage
// Manager.changeScene(viewport);

// activate plugins

// add a red box

console.log(Loader.shared.resources.logo.texture);
console.log(Loader.shared.resources.bunnyHead.texture);
const sprite = Sprite.from("bunny_head.png");
viewport.addChild(sprite);
