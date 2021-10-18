import {Container} from '@pixi/display';
import {Viewport} from 'pixi-viewport';
import {Scene} from './Scene';
import {MyAvatar} from './MyAvatar';
import {Manager} from './SceneManager';
import {World} from './World';
import {Loader} from '@pixi/loaders';
import {Ticker} from '@pixi/ticker';
import {Stuff} from './Stuff';
import {GameData} from './GameData';

const resources = Loader.shared.resources;
export class GameScene extends Container implements Scene {
  private viewport: Viewport;
  private player: MyAvatar;
  private world: World;

  constructor() {
    super();
    const world = new World(resources['background'].texture!);
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
    world.setViewport(viewport);
    viewport.pinch().wheel().decelerate();
    viewport.clamp({
      left: false, // whether to clamp to the left and at what value
      right: false, // whether to clamp to the right and at what value
      top: false, // whether to clamp to the top and at what value
      bottom: false, // whether to clamp to the bottom and at what value
      direction: 'all', // (all, x, or y) using clamps of [0, viewport.worldWidth / viewport.worldHeight]; replaces left / right / top / bottom if set
      underflow: 'center', // where to place world if too small for screen (e.g., top - right, center, none, bottomleft)
    });
    viewport.clampZoom({
      maxScale: 1.2,
      minScale: 0.2,
      // maxWidth: viewport.worldWidth, // maxHeight: world.height,
      // minWidth: viewport.worldWidth,
    });
    this.addChild(viewport);

    const player = new MyAvatar(world, GameData.getMyAvatar(), viewport);
    this.player = player;

    viewport.moveCenter(world.width / 2, world.height / 2);
    viewport.addChild(world);
    world.addMyAvatar(player);
    viewport.follow(player, {
      speed: 0,
      acceleration: null,
      radius: null,
    });

    const collideStuff = new Stuff(this.world, 'tree1', 500, 500);
    collideStuff.addCollisionBox(-70, -50, 100, 50);
    world.addChild(collideStuff);

    GameData.addExistingPeers(world);
    GameData.addOnPeerCreatedHandler(world.addPeerAvatar.bind(world));
    GameData.addOnPeerDeletedHandler(world.deletePeerAvatar.bind(world));
    // window.addEventListener('compositionupdate', handler, false);
    // function handler(e: Event) {
    //   console.log(e);
    // }
  }

  public update(framesPassed: number): void {
    this.world.update(framesPassed);
    //새로운 피어 등장을 파악해서, 월드에 추가해준다.
  }

  public resize(screenWidth: number, screenHeight: number): void {
    this.viewport.screenWidth = screenWidth;
    this.viewport.screenHeight = screenHeight;
    //if scrrenWidth가 작을 때 scale을 줄이도록 하면 모바일 반응형도 될듯
  }
}
