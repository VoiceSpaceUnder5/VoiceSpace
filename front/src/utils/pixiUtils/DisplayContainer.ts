import {Container} from '@pixi/display';
import {Loader} from '@pixi/loaders';
import {Sprite} from '@pixi/sprite';
import {CollisionBox} from './CollisionBox';
import {World} from './World';

const resources = Loader.shared.resources;

export class DisplayContainer extends Container {
  //members
  world: World;
  collidable: boolean;
  collisionBox: CollisionBox | null;
  parts: Sprite[];
  update: ((framesPassed: number) => void) | null;

  //constructor
  constructor(world: World) {
    super();

    this.world = world;
    this.collidable = false;
    this.collisionBox = null;
    this.parts = [];
    this.update = null;
  }

  //methods
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
      this.parts.push(Sprite.from(resources[part].texture!));
    });
  }

  setUpdate(update: (framesPassed: number) => void): void {
    this.update = update;
  }
}
