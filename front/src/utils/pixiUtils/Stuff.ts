import {Loader} from '@pixi/loaders';
import {Sprite} from '@pixi/sprite';
import {checkCollision, checkIntersect} from './CheckCollision';
import {DisplayContainer} from './DisplayContainer';
import {World} from './World';

const resources = Loader.shared.resources;

export class Stuff extends DisplayContainer {
  constructor(world: World, textureName: string, posX: number, posY: number) {
    super(world);

    this.position.set(posX, posY);
    const sprite = Sprite.from(resources[textureName].texture!);
    sprite.anchor.set(0.5, 1);
    this.zIndex = this.y;
    this.addChild(sprite);
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
