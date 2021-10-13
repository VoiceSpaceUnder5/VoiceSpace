import {Loader} from '@pixi/loaders';
import {Sprite} from '@pixi/sprite';
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
}
