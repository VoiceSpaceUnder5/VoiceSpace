import {Sprite} from '@pixi/sprite';
import {checkIntersect} from './CheckIntersect';
import {DisplayContainer} from './DisplayContainer';
import {ResourceManager} from './ResourceManager';
import {World} from './World';
import {DisplayContainerData} from './metaData/DataInterface';

export class Stuff extends DisplayContainer {
  private alphaChangable = true;

  constructor(world: World, data: DisplayContainerData) {
    super(world);

    if (data.position) this.position.set(data.position.x, data.position.y);
    data.parts.forEach(part => {
      const texture = ResourceManager.getTexture(
        part.textureName,
        part.spriteSheet,
      );
      if (!texture) return;
      if (data.alphaChangable) this.alphaChangable = data.alphaChangable;
      const sprite = Sprite.from(texture);
      sprite.position.set(part.position.x, part.position.y);
      sprite.anchor.set(part.anchor.x, part.anchor.y);
      this.addChild(sprite);

      if (data.collisionBox) this.addCollisionBox(data.collisionBox);
    });
    this.zIndex = this.y;
  }

  update(): void {
    if (this.alphaChangable) this.changeAlpha();
  }

  private changeAlpha(): void {
    if (this.world.player === null) return;
    if (this.world.player.collisionBox === null) return;
    if (checkIntersect(this.world.player.collisionBox, this)) {
      this.alpha = 0.5;
    } else this.alpha = 1;
  }
}
