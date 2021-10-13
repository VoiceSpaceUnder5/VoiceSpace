import { Texture } from "@pixi/core";
import { Container } from "@pixi/display";
import { IPointData } from "@pixi/math";
import { Sprite } from "@pixi/sprite";
import { Player } from "./Player";
import { World } from "./World";

export class IWorld extends Container implements World {
  public startPosition: IPointData;

  //생성자 인자는 나중에 World를 구성하는 요소들을 묶어서 받아야 한다.(수정 필요)
  constructor(background: Texture) {
    super();

    const backgroundSprite = Sprite.from(background);
    backgroundSprite.zIndex = -Infinity;
    this.addChild(backgroundSprite);
  }

  setStartPosition(x: number, y: number) {
    this.startPosition.x = x;
    this.startPosition.y = y;
  }

  update(framesPassed: number) {
    this.children.forEach((child) => {
      if ("update" in child) {
        child["update"](framesPassed, this);
      }
    });
  }
}
