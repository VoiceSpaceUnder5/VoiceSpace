import {Graphics} from '@pixi/graphics';
import {CollisionBoxData} from './metaData/DataInterface';

// x 와 y는 container의 pin으로 부터의 값(not center) 박스의 leftTop의 값,
export class CollisionBox extends Graphics {
  constructor(data: CollisionBoxData) {
    super();

    this.beginFill(0x0000ff, 0);
    this.drawRect(data.x, data.y, data.width, data.height);
  }
}
