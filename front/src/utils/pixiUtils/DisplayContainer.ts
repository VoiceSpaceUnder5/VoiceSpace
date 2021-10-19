import {Container} from '@pixi/display';
import {Sprite} from '@pixi/sprite';
import {CollisionBox} from './CollisionBox';
import {World} from './World';
import {ResourceManager} from './ResourceManager';

export class DisplayContainer extends Container {
  world: World;
  collidable: boolean;
  collisionBox: CollisionBox | null;
  parts: Sprite[];

  constructor(world: World) {
    super();

    this.world = world;
    this.collidable = false;
    this.collisionBox = null;
    this.parts = [];
  }

  update(framesPassed: number): void {
    framesPassed;
    return;
  }

  addCollisionBox(
    offsetX: number,
    offsetY: number,
    width: number,
    height: number,
  ): void {
    const collisionBox = new CollisionBox(offsetX, offsetY, width, height);
    this.addChild(collisionBox);
    this.collisionBox = collisionBox;
    this.collidable = true;
  }

  addParts(textureName: string[]): void {
    textureName.forEach(part => {
      const texture = ResourceManager.getTexture(part);
      if (texture === undefined) {
        console.error('Error: Resource parts undefined');
        return;
      }
      this.parts.push(Sprite.from(texture));
    });
  }

  addPart(sprite: Sprite): void {
    this.parts.push(sprite);
  }

  addPartsToChild(): void {
    this.parts.forEach(part => {
      this.addChild(part);
    });
  }
}
