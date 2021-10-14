import {Texture} from '@pixi/core';
import {Container} from '@pixi/display';
import {IPointData} from '@pixi/math';
import {Sprite} from '@pixi/sprite';
import {DisplayContainer} from './DisplayContainer';
import {IWorld} from './IWorld';

export class World extends Container implements IWorld {
  public startPosition: IPointData;
  public background: DisplayContainer;
  //생성자 인자는 나중에 World를 구성하는 요소들을 묶어서 받아야 한다.(수정 필요)
  constructor(backgroundTexture: Texture) {
    super();

    this.startPosition = {x: 0, y: 0};
    const background = new DisplayContainer(this);
    const backgroundSprite = Sprite.from(backgroundTexture);
    backgroundSprite.zIndex = -Infinity;
    background.addChild(backgroundSprite);
    this.background = background;
    this.addChild(background);
  }

  setStartPosition(x: number, y: number): void {
    this.startPosition.x = x;
    this.startPosition.y = y;
  }

  update(framesPassed: number): void {
    const children = this.children as DisplayContainer[];
    children.forEach(child => {
      child.update(framesPassed);
    });
  }
}
