import {MyAvatar} from './MyAvatar';
import {InteractionEvent} from 'pixi.js';
import {PLAYER_SPEED} from './metaData/DataInterface';

export class PlayerPointer {
  public pointerdown: boolean;
  private startPosX: number;
  private startPosY: number;
  private player: MyAvatar;

  constructor(player: MyAvatar) {
    this.pointerdown = false;
    this.startPosX = 0;
    this.startPosY = 0;
    this.player = player;

    this.initailizePointer();
  }

  public initailizePointer(): void {
    this.player.world.interactive = true;
    this.player.world
      .on('pointerdown', this.onPointerDown.bind(this))
      .on('pointermove', this.onPointerMove.bind(this))
      .on('pointerup', this.onPointerUp.bind(this))
      .on('pointerupoutside', this.onPointerUpOutside.bind(this));
  }

  private onPointerDown(e: InteractionEvent) {
    this.pointerdown = true;
    const pointerPos = e.data.getLocalPosition(this.player.viewport.parent);
    this.startPosX = pointerPos.x;
    this.startPosY = pointerPos.y;
  }

  private onPointerMove(e: InteractionEvent) {
    if (this.pointerdown === false) return;
    const point = e.data.getLocalPosition(this.player.viewport.parent);
    const diagonal = Math.sqrt(
      Math.pow(point.x - this.startPosX, 2) +
        Math.pow(point.y - this.startPosY, 2),
    );
    this.player.vx = (PLAYER_SPEED * (point.x - this.startPosX)) / diagonal;
    this.player.vy = (PLAYER_SPEED * (point.y - this.startPosY)) / diagonal;
    this.player.scale.x = this.player.vx < 0 ? -1 : 1;
  }

  private onPointerUp() {
    this.pointerdown = false;
    this.player.vx = 0;
    this.player.vy = 0;
  }

  private onPointerUpOutside() {
    this.pointerdown = false;
    this.player.vx = 0;
    this.player.vy = 0;
  }
}
