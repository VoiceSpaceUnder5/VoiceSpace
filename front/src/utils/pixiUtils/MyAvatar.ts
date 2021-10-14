import {DisplayObject} from '@pixi/display';
import {Avatar, AvatarParts, PARTS_ROTATE_SPEED, avatarName} from './Avatar';

import {PlayerKeyboard} from './PlayerKeyboard';
import {Viewport} from 'pixi-viewport';
import {CollisionBox} from './CollisionBox';
import {World} from './World';
import {checkCollision} from './CheckCollision';
import {DisplayContainer} from './DisplayContainer';
import {GameData} from './GameData';

export class MyAvatar extends DisplayContainer implements Avatar {
  public avatar: number;
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
    this.partRotateDegree = Array.from({length: 6}, () => 0);
    this.referenceDegree = 0;
    this.rotateClockWise = true;
    this.vx = 0;
    this.vy = 0;
    this.state = this.stand;
    this.parts = [];
    this.pivot.set(0.5, 0.5);
    this.keyboard = new PlayerKeyboard(this);
    this.position.copyFrom(world.startPosition);
    this.viewport = viewport;

    const partsTextureNames = [
      avatarName[avatar] + 'Arm',
      avatarName[avatar] + 'Arm',
      avatarName[avatar] + 'Body',
      avatarName[avatar] + 'Arm',
      avatarName[avatar] + 'Arm',
      avatarName[avatar] + 'Head',
    ];
    this.addParts(partsTextureNames);

    this.parts.forEach(part => {
      this.addChild(part);
    });

    this.setPartsPosition();

    const collisionBox = new CollisionBox(-15, this.height / 2 - 40, 30, 20);
    this.collisionBox = collisionBox;
    this.addChild(collisionBox);
  }

  //setter
  private setPartsPosition() {
    this.parts[AvatarParts.HEAD].anchor.set(0.45, 0.95);
    this.parts[AvatarParts.BODY].anchor.set(0.5, 0);

    this.parts[AvatarParts.LEFT_ARM].anchor.set(0.5, 0.2);
    this.parts[AvatarParts.LEFT_ARM].position.set(8, 5);

    this.parts[AvatarParts.LEFT_LEG].anchor.set(0.5, 0.2);
    this.parts[AvatarParts.LEFT_LEG].position.set(9, 42);

    this.parts[AvatarParts.RIGHT_ARM].anchor.set(0.5, 0.2);
    this.parts[AvatarParts.RIGHT_ARM].position.set(-8, 5);

    this.parts[AvatarParts.RIGHT_LEG].anchor.set(0.5, 0.2);
    this.parts[AvatarParts.RIGHT_LEG].position.set(-8, 42);
  }

  update(framesPassed: number): void {
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

  private isMoving() {
    return (
      this.keyboard.left.isDown ||
      this.keyboard.right.isDown ||
      this.keyboard.up.isDown ||
      this.keyboard.down.isDown
    );
  }

  private initArmAndLegsAngle() {
    this.parts[AvatarParts.HEAD].angle = 0;
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
    this.parts[AvatarParts.HEAD].angle = this.referenceDegree * 0.3;
    this.updatePartRotateAngle();
  }

  private standGesture() {
    this.updateReferenceAngle();
    this.parts[AvatarParts.RIGHT_ARM].angle = this.referenceDegree * 1;
    this.parts[AvatarParts.LEFT_ARM].angle = -this.referenceDegree * 1;
    this.parts[AvatarParts.HEAD].angle = this.referenceDegree * 0.1;
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
