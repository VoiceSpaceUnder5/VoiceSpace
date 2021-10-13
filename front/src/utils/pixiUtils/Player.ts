import {DisplayObject} from '@pixi/display';
import {Avatar} from './Avatar';
import {Loader} from '@pixi/loaders';
import {PlayerKeyboard} from './PlayerKeyboard';
import {Viewport} from 'pixi-viewport';
import {CollisionBox} from './CollisionBox';
import {World} from './World';
import {checkCollision} from './CheckCollision';
import {DisplayContainer} from './DisplayContainer';

enum AvatarParts {
  LEFT_ARM,
  LEFT_LEG,
  BODY,
  RIGHT_ARM,
  RIGHT_LEG,
  HEAD,
}

export class Player extends DisplayContainer implements Avatar {
  public name: string;
  public vx: number;
  public vy: number;
  private keyboard: PlayerKeyboard;
  private state: (framesPassed: number) => void;
  private elapsed: number;
  private viewport: Viewport;
  constructor(world: World, name: string, viewport: Viewport) {
    super(world);

    this.name = name;
    this.vx = 0;
    this.vy = 0;
    this.state = this.stand;
    this.elapsed = 0.0;
    this.parts = [];
    this.pivot.set(0.5, 0.5);
    this.keyboard = new PlayerKeyboard(this);
    this.position.set(viewport.worldWidth / 2, viewport.worldHeight / 2);
    this.viewport = viewport;

    const partsTextureNames = [
      'bunnyArm',
      'bunnyArm',
      'bunnyBody',
      'bunnyArm',
      'bunnyArm',
      'bunnyHead',
    ];
    this.addParts(partsTextureNames);

    this.parts.forEach(value => {
      this.addChild(value);
    });

    this.setPartsPosition();

    const collisionBox = new CollisionBox(-10, this.height / 2 - 40, 20, 20);
    this.collisionBox = collisionBox;
    this.addChild(collisionBox);

    this.setUpdate(this.updatePlayer);
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

  public updatePlayer(framesPassed: number): void {
    //Update the current game state:
    // console.log(this.keyboard.down.isDown);
    if (this.isMoving()) {
      this.state = this.move;
      this.initArmAndLegsAngle();
    } else {
      this.state = this.stand;
      this.initArmAndLegsAngle();
    }
    this.state(framesPassed);
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

    this.moveGesture(delta);
  }

  private stand(delta: number): void {
    this.standGesture(delta);
  }

  private moveGesture(delta: number) {
    this.elapsed += delta;
    this.parts[AvatarParts.RIGHT_LEG].angle +=
      Math.cos(this.elapsed / 5.0) * 20 * delta;
    this.parts[AvatarParts.RIGHT_ARM].angle -=
      Math.cos(this.elapsed / 5.0) * 30 * delta;
    this.parts[AvatarParts.LEFT_LEG].angle -=
      Math.cos(this.elapsed / 5.0) * 20 * delta;
    this.parts[AvatarParts.LEFT_ARM].angle +=
      Math.cos(this.elapsed / 5.0) * 30 * delta;
    this.parts[AvatarParts.HEAD].angle +=
      Math.cos(this.elapsed / 5.0) * 4 * delta;
  }

  private standGesture(delta: number) {
    this.elapsed += delta;
    this.parts[AvatarParts.RIGHT_ARM].angle -=
      Math.cos(this.elapsed / 15.0) * 20 * delta;
    this.parts[AvatarParts.LEFT_ARM].angle +=
      Math.cos(this.elapsed / 15.0) * 20 * delta;
    this.parts[AvatarParts.HEAD].angle += Math.cos(this.elapsed / 15) * delta;
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
