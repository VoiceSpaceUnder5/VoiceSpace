import { Bounds, Container } from "@pixi/display";
import { Sprite } from "@pixi/sprite";
import { Viewport } from "pixi-viewport";
import { Scene } from "./Scene";
import { Player } from "./Player";
import { Manager } from "./SceneManager";
import { IWorld } from "./IWorld";
import { Loader } from "@pixi/loaders";
import { keyboard } from "./Keyboard";
import { Ticker } from "@pixi/ticker";
import { Stuff } from "./Stuff";
import { checkCollision } from "./CheckCollision";
import { Rectangle } from "@pixi/math";

const resources = Loader.shared.resources;
export class GameScene extends Container implements Scene {
  private viewport: Viewport;
  private player: Player;
  private world: IWorld;

  constructor() {
    super();
    const world = new IWorld(resources["background"].texture);
    world.sortableChildren = true;
    this.world = world;

    const viewport = new Viewport({
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      worldWidth: world.width,
      worldHeight: world.height,
      ticker: Ticker.shared,
      interaction: Manager.app.renderer.plugins.interaction, // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
    });
    this.viewport = viewport;
    viewport.pinch().wheel().decelerate();
    viewport.clamp({
      left: false, // whether to clamp to the left and at what value
      right: false, // whether to clamp to the right and at what value
      top: false, // whether to clamp to the top and at what value
      bottom: false, // whether to clamp to the bottom and at what value
      direction: "all", // (all, x, or y) using clamps of [0, viewport.worldWidth / viewport.worldHeight]; replaces left / right / top / bottom if set
      underflow: "center", // where to place world if too small for screen (e.g., top - right, center, none, bottomleft)
    });
    viewport.clampZoom({
      maxScale: 1.2,
      minScale: 0.2,
      // maxWidth: viewport.worldWidth, // maxHeight: world.height,
      // minWidth: viewport.worldWidth,
    });
    this.addChild(viewport);

    const player = new Player("bunny", viewport);
    this.player = player;

    viewport.moveCenter(world.width / 2, world.height / 2);
    viewport.addChild(world);
    world.addChild(player);

    viewport.follow(player, {
      speed: 0,
      acceleration: null,
      radius: null,
    });

    const collideStuff = new Stuff("tree1", 500, 500);
    collideStuff.addCollisionBox(-70, -50, 100, 50);
    world.addChild(collideStuff);
  }

  public update(framesPassed: number) {
    // this.player.update(framesPassed, this.world);
    this.world.update(framesPassed);
    // console.log(this.player.children[6]._bounds);
    // console.log(this.world.getChildAt(2));
  }

  public resize(screenWidth: number, screenHeight: number) {
    this.viewport.screenWidth = screenWidth;
    this.viewport.screenHeight = screenHeight;
    //if scrrenWidth가 작을 때 scale을 줄이도록 하면 모바일 반응형도 될듯
  }
}
