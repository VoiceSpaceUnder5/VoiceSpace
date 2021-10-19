import {Container} from '@pixi/display';
import {Sprite} from '@pixi/sprite';
import {CollisionBox} from './CollisionBox';
import {World} from './World';
import {ResourceManager} from './ResourceManager';
import {collisionBoxData} from './metaData/DataInterface';
import {PartsData} from './metaData/DataInterface';

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

  addCollisionBox(data: collisionBoxData): void {
    const collisionBox = new CollisionBox(
      data.x,
      data.y,
      data.width,
      data.height,
    );
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

  makeSpriteFromPartsMD(part: PartsData): Sprite | undefined {
    const texture = ResourceManager.getTexture(
      part.textureName,
      part.spriteSheet,
    );
    if (!texture) return;
    const sprite = Sprite.from(texture);
    sprite.position.set(part.position.x, part.position.y);
    sprite.anchor.set(part.anchor.x, part.anchor.y);
    return sprite;
  }
}
