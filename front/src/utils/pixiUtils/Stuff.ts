import {Sprite} from '@pixi/sprite';
import {checkIntersect} from './CheckCollision';
import {DisplayContainer} from './DisplayContainer';
import {ResourceManager} from './ResourceManager';
import {World} from './World';

interface StuffPartMD {
  spriteSheet: string;
  textureName: string;
  position: {x: number; y: number};
  anchor: {x: number; y: number};
}
interface StuffMD {
  position: {x: number; y: number};
  parts: StuffPartMD[];
  collisionBox: {x: number; y: number; width: number; height: number} | null;
}

export class Stuff extends DisplayContainer {
  constructor(world: World, metaData: StuffMD) {
    super(world);

    this.position.set(metaData.position.x, metaData.position.y);
    metaData.parts.forEach(part => {
      const texture = ResourceManager.getTextureFromSheet(
        part.textureName,
        part.spriteSheet,
      );
      if (!texture) return;

      const sprite = Sprite.from(texture);
      sprite.position.set(part.position.x, part.position.y);
      sprite.anchor.set(part.anchor.x, part.anchor.y);
      this.addChild(sprite);

      if (metaData.collisionBox) {
        const box = metaData.collisionBox;
        this.addCollisionBox(box.x, box.y, box.width, box.height);
      }
    });
    this.zIndex = this.y;
  }

  update(framesPassed: number): void {
    this.changeAlpha();
  }

  private changeAlpha(): void {
    if (this.world.player === null) return;
    if (this.world.player.collisionBox === null) return;
    if (checkIntersect(this.world.player.collisionBox, this)) {
      this.alpha = 0.5;
    } else this.alpha = 1;
  }
}
