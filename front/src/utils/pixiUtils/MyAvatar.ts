import {DisplayObject} from '@pixi/display';
import {AvatarParts, PARTS_ROTATE_SPEED, Avatar} from './Avatar';
import {PlayerKeyboard} from './PlayerKeyboard';
import {Viewport} from 'pixi-viewport';
import {World} from './World';
import {checkIntersect} from './CheckIntersect';
import {DisplayContainer} from './DisplayContainer';
import {GameData} from './GameData';

export class MyAvatar extends Avatar {
  private referenceDegree: number;
  private rotateClockWise: boolean;
  public vx: number;
  public vy: number;
  private keyboard: PlayerKeyboard;
  private state: (framesPassed: number) => void;

  constructor(world: World, viewport: Viewport) {
    super(world, viewport);

    this.referenceDegree = 0;
    this.rotateClockWise = true;
    this.vx = 0;
    this.vy = 0;
    this.state = this.stand;
    this.pivot.set(0.5, 0.5);
    this.keyboard = new PlayerKeyboard(this, 'KeyA', 'KeyD', 'KeyW', 'KeyS');
  }

  //setter
  update(framesPassed: number): void {
    if (this.isAvatarChanged()) {
      this.avatarImageEnum = GameData.getMyAvatar();
      this.changeAvatar(this.getAvatarMD());
    }
    this.updateFace();
    if (this.isMoving()) {
      this.state = this.move;
    } else {
      this.state = this.stand;
      this.initArmAndLegsAngle();
    }
    this.state(framesPassed);
    GameData.updatePlayerDto(this);
    GameData.sendMyDto();
    GameData.setDivPos(this);
  }

  updateFace(): void {
    this.avatarFace = GameData.getMyAvatarFace();
    this.avatarFaceScale = GameData.getMyAvatarFaceScale();
    this.parts[AvatarParts.FACE].scale.set(this.avatarFaceScale);
    this.swapFace();
  }

  private isMoving() {
    return (
      this.keyboard.left.isDown ||
      this.keyboard.right.isDown ||
      this.keyboard.up.isDown ||
      this.keyboard.down.isDown
    );
  }

  private initArmAndLegsAngle() {
    this.parts[AvatarParts.LEFT_ARM].angle = 0;
    this.parts[AvatarParts.LEFT_LEG].angle = 0;
    this.parts[AvatarParts.RIGHT_ARM].angle = 0;
    this.parts[AvatarParts.RIGHT_LEG].angle = 0;
  }

  private move(delta: number): void {
    const oldX = this.x;
    const oldY = this.y;

    this.x += this.vx * delta;
    this.y += this.vy * delta;
    if (this.isCollided(this.world)) {
      this.x = oldX;
      this.y = oldY;
    }
    this.zIndex = this.y + this.height / 2;
    this.moveGesture();
  }

  private stand(): void {
    this.standGesture();
  }

  private moveGesture() {
    this.updateReferenceAngle();
    this.parts[AvatarParts.RIGHT_LEG].angle = -this.referenceDegree * 1;
    this.parts[AvatarParts.RIGHT_ARM].angle = this.referenceDegree * 2;
    this.parts[AvatarParts.LEFT_LEG].angle = this.referenceDegree * 1;
    this.parts[AvatarParts.LEFT_ARM].angle = -this.referenceDegree * 2;
    this.parts[AvatarParts.FACE].angle = this.referenceDegree * 0.3;
    this.updatePartRotateAngle();
  }

  private standGesture() {
    this.updateReferenceAngle();
    this.parts[AvatarParts.RIGHT_ARM].angle = this.referenceDegree * 1;
    this.parts[AvatarParts.LEFT_ARM].angle = -this.referenceDegree * 1;
    this.parts[AvatarParts.FACE].angle = this.referenceDegree * 0.1;
    this.updatePartRotateAngle();
  }

  private updateReferenceAngle() {
    if (this.referenceDegree > 15 || this.referenceDegree < -15)
      this.rotateClockWise = !this.rotateClockWise;
    if (this.rotateClockWise === true)
      this.referenceDegree -= PARTS_ROTATE_SPEED;
    else this.referenceDegree += PARTS_ROTATE_SPEED;
  }

  private updatePartRotateAngle() {
    for (let i = 0; i < 6; ++i) {
      this.partRotateDegree[i] = this.parts[i].angle;
    }
  }

  private isCollided(world: World): boolean {
    const stuffs = world.children as DisplayContainer[];
    if (isOutOfWorld(this, this.viewport, 50)) return true;
    for (let i = 1; i < stuffs.length; ++i) {
      if (
        !(this === stuffs[i]) &&
        stuffs[i].collisionBox &&
        checkIntersect(
          this.collisionBox as DisplayObject,
          stuffs[i].collisionBox as DisplayObject,
        )
      )
        return true;
    }
    return false;
  }

  private isAvatarChanged() {
    return this.avatarImageEnum !== GameData.getMyAvatar();
  }
}

export function isOutOfWorld(
  target: DisplayObject,
  viewport: Viewport,
  padding: number,
): boolean {
  if (
    target.x > viewport.worldWidth - padding ||
    target.x < 0 + padding ||
    target.y > viewport.worldHeight - padding ||
    target.y < 0 + padding
  )
    return true;
  return false;
}
