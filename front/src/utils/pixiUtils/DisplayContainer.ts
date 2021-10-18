import {Container} from '@pixi/display';
import {Loader} from '@pixi/loaders';
import {Sprite} from '@pixi/sprite';
import {CollisionBox} from './CollisionBox';
import {World} from './World';
import {Resource, Texture} from 'pixi.js';

const resources = Loader.shared.resources;

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
      if (resources[part].texture === undefined) {
        console.error('Error: Resource parts undefined');
        return;
      }
      const partTexture = resources[part].texture as Texture<Resource>;
      this.parts.push(Sprite.from(partTexture));
    });
  }
}
