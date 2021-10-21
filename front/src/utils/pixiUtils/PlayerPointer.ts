import {MyAvatar} from './MyAvatar';
import {InteractionEvent} from 'pixi.js';
import {PLAYER_SPEED} from './metaData/DataInterface';
import {Joystick} from './Joystick';

export class PlayerPointer {
  public pointerdown: boolean;
  private startPosX: number;
  private startPosY: number;
  private player: MyAvatar;
  private joystick?: Joystick;

  constructor(player: MyAvatar, joystick?: Joystick) {
    this.pointerdown = false;
    this.startPosX = 0;
    this.startPosY = 0;
    this.player = player;
    if (joystick) this.setJoystick(joystick);

    this.initailizePointer();
  }

  public initailizePointer(): void {
    this.player.world.interactive = true;
    this.player.world
      .on('pointerdown', this.onPointerDown.bind(this))
      .on('pointermove', this.onPointerMove.bind(this))
      .on('pointerup', this.onPointerUp.bind(this))
      .on('pointerupoutside', this.onPointerUp.bind(this));
  }

  private onPointerDown(e: InteractionEvent) {
    this.pointerdown = true;
    const pointerPos = e.data.getLocalPosition(this.player.viewport.parent);
    this.startPosX = pointerPos.x;
    this.startPosY = pointerPos.y;
    if (this.joystick)
      this.joystick.revealJoystick(this.startPosX, this.startPosY);
  }

  private onPointerMove(e: InteractionEvent) {
    if (this.pointerdown === false) return;
    const point = e.data.getLocalPosition(this.player.viewport.parent);
    const xDiff = point.x - this.startPosX;
    const yDiff = point.y - this.startPosY;
    const diagonal = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));
    this.player.vx = PLAYER_SPEED * (xDiff / diagonal);
    this.player.vy = PLAYER_SPEED * (yDiff / diagonal);
    this.player.scale.x = this.player.vx < 0 ? -1 : 1;
    if (this.joystick)
      this.joystick.setSmallCirclePosition({x: xDiff, y: yDiff}, diagonal);
  }

  private onPointerUp() {
    this.pointerdown = false;
    this.player.vx = 0;
    this.player.vy = 0;
    if (this.joystick) this.joystick.hideJoystick();
  }

  private setJoystick(joystick: Joystick) {
    this.joystick = joystick;
    this.player.viewport.parent.addChild(joystick);
  }
}
