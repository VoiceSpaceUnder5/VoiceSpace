import { Container } from "@pixi/display";
import { Graphics } from "@pixi/graphics";

// x 와 y는 container의 pin으로 부터의 값(not center) 박스의 leftTop의 값,
export class CollisionBox extends Graphics {
  constructor(x: number, y: number, width: number, height: number) {
    super();

    this.beginFill(0x0000ff, 1);
    this.drawRect(x, y, width, height);
  }
}
