import {Container} from '@pixi/display';
import {Viewport} from 'pixi-viewport';
import {Scene} from './Scene';
import {MyAvatar} from './MyAvatar';
import {World} from './World';
import {GameData} from './GameData';
import world1Json from './metaData/world1.json';
import {createViewport} from './ViewportUtils';

export class GameScene extends Container implements Scene {
  private viewport: Viewport;
  private world: World;

  constructor() {
    super();

    //
    const world = new World(world1Json);
    this.world = world;
    //viewport create
    const viewport = createViewport(world.width, world.height);
    this.viewport = viewport;
    //worldsetViewport
    world.setViewport(viewport);
    //this.addchild-viewport
    this.addChild(viewport);
    //viewport-addchild world
    viewport.addChild(world);
    //world-addMyAvatar
    const player = new MyAvatar(world, viewport);
    player.setAvatar(GameData.getMyAvatar());
    world.addMyAvatar(player);
    viewport.follow(player);

    //Peer를 World에 추가하고 제거하는 기능
    GameData.addExistingPeers(world);
    GameData.addOnPeerCreatedHandler(world.addPeerAvatar.bind(world));
    GameData.addOnPeerDeletedHandler(world.deletePeerAvatar.bind(world));
  }

  public update(framesPassed: number): void {
    this.world.update(framesPassed);
  }

  public resize(screenWidth: number, screenHeight: number): void {
    this.viewport.screenWidth = screenWidth;
    this.viewport.screenHeight = screenHeight;
  }
}
