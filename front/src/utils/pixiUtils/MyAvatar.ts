import {DisplayObject} from '@pixi/display';
import {Avatar, AvatarParts, PARTS_ROTATE_SPEED, avatarName} from './Avatar';
import {Loader} from '@pixi/loaders';
import {MyAvatarKeyboard} from './PlayerKeyboard';
import {Viewport} from 'pixi-viewport';
import {CollisionBox} from './CollisionBox';
import {World} from './World';
import {checkCollision} from './CheckCollision';
import {DisplayContainer} from './DisplayContainer';
import {GameData} from './GameData';

export class MyAvatar extends DisplayContainer implements Avatar {
  public avatar: number;
  public partRotateDegree: number;
  public rotateClockWise: boolean;
  public vx: number;
  public vy: number;
  private keyboard: MyAvatarKeyboard;
  private state: (framesPassed: number) => void;
  private viewport: Viewport;

  constructor(world: World, avatar: number, viewport: Viewport) {
    super(world);

    this.avatar = avatar;
    this.partRotateDegree = 0;
    this.rotateClockWise = true;
    this.vx = 0;
    this.vy = 0;
    this.state = this.stand;
    this.parts = [];
    this.pivot.set(0.5, 0.5);
    this.keyboard = new MyAvatarKeyboard(this);
    this.position.set(viewport.worldWidth / 2, viewport.worldHeight / 2);
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

    this.parts.forEach(value => {
      this.addChild(value);
    });

    this.setPartsPosition();

    const collisionBox = new CollisionBox(-10, this.height / 2 - 40, 20, 20);
    this.collisionBox = collisionBox;
    this.addChild(collisionBox);

    this.setUpdate(this.updateMyAvatar);
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

  public updateMyAvatar(framesPassed: number): void {
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
    this.updatePartRotateDegree();
    this.parts[AvatarParts.RIGHT_LEG].angle = -this.partRotateDegree * 1;
    this.parts[AvatarParts.RIGHT_ARM].angle = this.partRotateDegree * 2;
    this.parts[AvatarParts.LEFT_LEG].angle = this.partRotateDegree * 1;
    this.parts[AvatarParts.LEFT_ARM].angle = -this.partRotateDegree * 2;
    this.parts[AvatarParts.HEAD].angle = this.partRotateDegree * 0.3;
  }

  private standGesture() {
    this.updatePartRotateDegree();
    this.parts[AvatarParts.RIGHT_ARM].angle = this.partRotateDegree * 1;
    this.parts[AvatarParts.LEFT_ARM].angle = -this.partRotateDegree * 1;
    this.parts[AvatarParts.HEAD].angle = this.partRotateDegree * 0.1;
  }

  private updatePartRotateDegree() {
    if (this.partRotateDegree > 15 || this.partRotateDegree < -15)
      this.rotateClockWise = !this.rotateClockWise;
    if (this.rotateClockWise === true)
      this.partRotateDegree -= PARTS_ROTATE_SPEED;
    else this.partRotateDegree += PARTS_ROTATE_SPEED;
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
