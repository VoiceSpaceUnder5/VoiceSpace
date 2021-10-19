import {Texture} from '@pixi/core';
import {Container} from '@pixi/display';
import {IPointData} from '@pixi/math';
import {Sprite} from '@pixi/sprite';
import {DisplayContainer} from './DisplayContainer';
import {MyAvatar} from './MyAvatar';
import {PeerAvatar} from './PeerAvatar';
import {Viewport} from 'pixi-viewport';

export interface IWorld {
  startPosition: {x: number; y: number};
}

export class World extends Container implements IWorld {
  public startPosition: IPointData;
  public background: DisplayContainer;
  public player: MyAvatar | null;
  public peers: Map<string, PeerAvatar>;
  public viewport: Viewport | null;

  //생성자 인자는 나중에 World를 구성하는 요소들을 묶어서 받아야 한다.(수정 필요)
  constructor(backgroundTexture: Texture) {
    super();
    this.startPosition = {x: 300, y: 300};
    const background = new DisplayContainer(this);
    const backgroundSprite = Sprite.from(backgroundTexture);
    backgroundSprite.zIndex = -Infinity;
    background.addChild(backgroundSprite);
    this.background = background;
    this.addChild(background);
    this.player = null;
    this.peers = new Map();
    this.viewport = null;
    this.sortableChildren = true;
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
