import { Bounds, Container } from "@pixi/display";
import { Loader } from "@pixi/loaders";
import { Rectangle } from "@pixi/math";
import { Sprite } from "@pixi/sprite";
import * as PIXI from "pixi.js";
import { CollisionBox } from "./CollisionBox";

const resources = Loader.shared.resources;

export class Stuff extends Container {
  public collidable: boolean = false;
  public collisionBox: CollisionBox;

  constructor(textureName: string, posX: number, posY: number) {
    super();

    this.position.set(posX, posY);
    const sprite = Sprite.from(resources[textureName].texture);
    sprite.anchor.set(0.5, 1);
    this.zIndex = this.y;
    this.addChild(sprite);
  }

  addCollisionBox(x: number, y: number, width: number, height: number) {
    const collisionBox = new CollisionBox(x, y, width, height);
    this.addChild(collisionBox);
    this.collisionBox = collisionBox;
  }

  // update(framesPassed:number,){

  // }
}
