import {Container} from '@pixi/display';
import {IPointData} from '@pixi/math';
import {Sprite} from '@pixi/sprite';
import {DisplayContainer} from './DisplayContainer';
import {MyAvatar} from './MyAvatar';
import {PeerAvatar} from './PeerAvatar';
import {Viewport} from 'pixi-viewport';
import {
  BackgroundData,
  DisplayContainerData,
  WorldData,
} from './metaData/DataInterface';
import {ResourceManager} from './ResourceManager';
import {Stuff} from './Stuff';

interface IWorld {
  startPosition: {x: number; y: number};
}

export class World extends Container implements IWorld {
  public startPosition: IPointData;
  public background: DisplayContainer;
  public stuffs: DisplayContainer[];
  public player: MyAvatar | null;
  public peers: Map<string, PeerAvatar>;
  public viewport: Viewport | null;

  //생성자 인자는 나중에 World를 구성하는 요소들을 묶어서 받아야 한다.(수정 필요)
  constructor(data: WorldData) {
    super();
    this.startPosition = {x: 0, y: 0};
    this.background = new DisplayContainer(this);
    this.stuffs = [];
    this.player = null;
    this.peers = new Map();
    this.viewport = null;
    this.sortableChildren = true;
    this.changeWorld(data);
  }

  changeWorld(data: WorldData): void {
    this.startPosition = data.startPosition;
    this.changeBackground(data.background);
    this.clearStuffs();
    this.addStuffs(data.stuffs);
  }

  changeBackground(data: BackgroundData): void {
    const background = new DisplayContainer(this);
    const backgroundTexture = ResourceManager.getTexture(data.textureName);
    if (!backgroundTexture) {
      console.error(
        "Error: There's no matching texturename in ResourceManager",
      );
      return;
    }
    const backgroundSprite = Sprite.from(backgroundTexture);
    background.addChild(backgroundSprite);
    background.zIndex = -1;
    this.background = background;
    this.addChild(background);
  }

  addStuffs(datas: DisplayContainerData[]): void {
    datas.forEach(data => {
      const stuff = new Stuff(this, data);
      this.stuffs.push(stuff);
      this.addChild(stuff);
    });
  }

  clearStuffs(): void {
    this.stuffs.forEach(stuff => {
      stuff.destroy();
    });
    this.stuffs.length = 0;
  }

  setStartPosition(x: number, y: number): void {
    this.startPosition.x = x;
    this.startPosition.y = y;
  }

  update(framesPassed: number): void {
    const children = this.children as DisplayContainer[];
    children.forEach(child => {
      child.update(framesPassed);
    });
  }

  addMyAvatar(myAvatar: MyAvatar): void {
    this.addChild(myAvatar);
    this.player = myAvatar;
  }

  addPeerAvatar(socketID: string): void {
    if (this.peers.has(socketID)) return;

    if (this.viewport === null) return;
    const newPeer = new PeerAvatar(this, socketID, this.viewport);
    console.log(this.addChild);
    this.addChild(newPeer);
    this.peers.set(socketID, newPeer);
  }

  deletePeerAvatar(socketID: string): void {
    if (this.peers.has(socketID)) this.peers.get(socketID)?.destroy();
  }

  setViewport(viewport: Viewport): void {
    this.viewport = viewport;
  }
}
