import {Container} from '@pixi/display';
import {Viewport} from 'pixi-viewport';
import {Scene} from './Scene';
import {MyAvatar} from './MyAvatar';
import {World} from './World';
import {Loader} from '@pixi/loaders';
import {Stuff} from './Stuff';
import {GameData} from './GameData';
import world1Json from './world1.json';
import {createViewport} from './viewportUtils';
import {Texture, Resource} from 'pixi.js';

const resources = Loader.shared.resources;
export class GameScene extends Container implements Scene {
  private viewport: Viewport;
  private player: MyAvatar;
  private world: World;

  constructor() {
    super();

    const backgroundTexture = resources['background']
      .texture as Texture<Resource>;
    const world = new World(backgroundTexture);
    this.world = world;

    const viewport = createViewport(world.width, world.height);
    this.viewport = viewport;
    world.setViewport(viewport);
    this.addChild(viewport);

    const player = new MyAvatar(world, GameData.getMyAvatar(), viewport);
    this.player = player;
    viewport.addChild(world);
    world.addMyAvatar(player);
    viewport.follow(player);

    const collideStuff = new Stuff(this.world, world1Json.stuffs[0]);
    world.addChild(collideStuff);

    GameData.addExistingPeers(world);
    GameData.addOnPeerCreatedHandler(world.addPeerAvatar.bind(world));
    GameData.addOnPeerDeletedHandler(world.deletePeerAvatar.bind(world));
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
