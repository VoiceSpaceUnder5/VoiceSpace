import { Container, DisplayObject } from "@pixi/display";
import { Avatar } from "./Avatar";
import { Loader } from "@pixi/loaders";
import { Sprite } from "@pixi/sprite";
import { Ticker } from "@pixi/ticker";
import { PlayerKeyboard } from "./PlayerKeyboard";
import { Viewport } from "pixi-viewport";
import { Texture } from "@pixi/core";
import { Rectangle } from "@pixi/math";
import { CollisionBox } from "./CollisionBox";
import { World } from "./World";
import { IWorld } from "./IWorld";
import { checkCollision } from "./CheckCollision";

const resources = Loader.shared.resources;

enum AvatarParts {
  LEFT_ARM,
  LEFT_LEG,
  BODY,
  RIGHT_ARM,
  RIGHT_LEG,
  HEAD,
}

export class Player extends Container implements Avatar {
  public name: string;
  public vx: number;
  public vy: number;
  private keyboard: PlayerKeyboard;
  private state: Function;
  private elapsed: number;
  private parts: Sprite[];
  private viewport: Viewport;
  public collidable: boolean = true;
  public collisionBox: CollisionBox;

  constructor(name: string, viewport: Viewport) {
    super();

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

    this.parts[AvatarParts.LEFT_ARM] = Sprite.from(
      resources[name + "Arm"].texture
    );
    this.parts[AvatarParts.LEFT_LEG] = Sprite.from(
      resources[name + "Arm"].texture
    );
    this.parts[AvatarParts.RIGHT_ARM] = Sprite.from(
      resources[name + "Arm"].texture
    );
    this.parts[AvatarParts.RIGHT_LEG] = Sprite.from(
      resources[name + "Arm"].texture
    );
    this.parts[AvatarParts.BODY] = Sprite.from(
      resources[name + "Body"].texture
    );
    this.parts[AvatarParts.HEAD] = Sprite.from(
      resources[name + "Head"].texture
    );

    this.parts.forEach((value) => {
      this.addChild(value);
    });

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

    const collisionBox = new CollisionBox(-10, this.height / 2 - 40, 20, 20);
    this.collisionBox = collisionBox;
    this.addChild(collisionBox);
  }

  public update(framesPassed: number, world: IWorld) {
    //Update the current game state:
    // console.log(this.keyboard.down.isDown);
    if (this.isMoving()) {
      this.state = this.move;
      this.initArmAndLegsAngle();
    } else {
      this.state = this.stand;
      this.initArmAndLegsAngle();
    }
    this.state(framesPassed, world);
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

  private move(delta: number, world: IWorld) {
    const oldX = this.x;
    const oldY = this.y;

    this.x += this.vx * delta;
    this.y += this.vy * delta;
    if (this.isCollided(world)) {
      this.x = oldX;
      this.y = oldY;
    }
    this.zIndex = this.y + this.height / 2;

    this.moveGesture(delta);
  }

  private stand(delta: number, world: IWorld) {
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

  private isCollided(world: IWorld): boolean {
    const stuffs: DisplayObject[] = world.children;
    if (isOutOfWorld(this, this.viewport, 50)) return true;
    for (let i = 1; i < stuffs.length; ++i) {
      if (!(this === stuffs[i]) && checkCollision(this, stuffs[i])) return true;
    }
    if (this.x > world.width) return false;
  }
}

function isOutOfWorld(
  target: DisplayObject,
  viewport: Viewport,
  padding: number
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
