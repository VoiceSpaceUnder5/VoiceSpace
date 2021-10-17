import {DisplayObject} from '@pixi/display';
import {
  Avatar,
  AvatarParts,
  PARTS_ROTATE_SPEED,
  newAvatar,
  swapFace,
} from './Avatar';
import {PlayerKeyboard} from './PlayerKeyboard';
import {Viewport} from 'pixi-viewport';
import {World} from './World';
import {checkCollision} from './CheckCollision';
import {DisplayContainer} from './DisplayContainer';
import {GameData} from './GameData';
import {AvatarPartImageEnum} from '../ImageMetaData';
import {Sprite} from '@pixi/sprite';

export class MyAvatar extends DisplayContainer implements Avatar {
  public avatar: number;
  public avatarFace: AvatarPartImageEnum;
  public avatarFaceScale: number;
  public partRotateDegree: number[];
  private referenceDegree: number;
  private rotateClockWise: boolean;
  public vx: number;
  public vy: number;
  private keyboard: PlayerKeyboard;
  private state: (framesPassed: number) => void;
  private viewport: Viewport;

  constructor(world: World, avatar: number, viewport: Viewport) {
    super(world);

    this.avatar = avatar;
    this.avatarFace = AvatarPartImageEnum.FACE_MUTE;
    this.avatarFaceScale = 1.0;
    this.partRotateDegree = Array.from({length: 6}, () => 0);
    this.referenceDegree = 0;
    this.rotateClockWise = true;
    this.vx = 0;
    this.vy = 0;
    this.state = this.stand;
    this.parts = [];
    this.pivot.set(0.5, 0.5);
    this.keyboard = new PlayerKeyboard(this, 'KeyA', 'KeyD', 'KeyW', 'KeyS');
    this.position.copyFrom(world.startPosition);
    this.viewport = viewport;
    newAvatar(this, avatar);
  }

  //setter
  update(framesPassed: number): void {
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
  }

  updateFace(): void {
    this.avatarFace = GameData.getMyAvatarFace();
    this.avatarFaceScale = GameData.getMyAvatarFaceScale();
    this.parts[AvatarParts.FACE].scale.set(this.avatarFaceScale);
    swapFace(
      this.avatar,
      this.children[AvatarParts.FACE] as Sprite,
      this.avatarFace,
    );
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
    // this.parts[AvatarParts.FACE].angle = 0;
    this.parts[AvatarParts.LEFT_ARM].angle = 0;
    this.parts[AvatarParts.LEFT_LEG].angle = 0;
    this.parts[AvatarParts.RIGHT_ARM].angle = 0;
    this.parts[AvatarParts.RIGHT_LEG].angle = 0;
  }

  // private changeVx() {}
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
    // GameData.testPrint();
  }

  private stand(delta: number): void {
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
      if (!(this === stuffs[i]) && checkCollision(this, stuffs[i])) return true;
    }
    return false;
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
