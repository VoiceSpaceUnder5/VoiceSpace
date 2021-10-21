import {Container} from '@pixi/display';
import {Graphics} from '@pixi/graphics';
import {Vec2} from '../RTCGameUtils';

interface JoystickOption {
  bigCircleRadius?: number;
  bigCircleColor?: number;
  bigCircleAlpha?: number;
  smallCircleRadius?: number;
  smallCircleColor?: number;
  smallCircleAlpha?: number;
}

// interface IJoystick {
//   bigCircleRadius: number;
//   bigCircleColor: number;
//   bigCircleAlpha: number;
//   // private smallCircleRadius: number;
//   // private smallCircleColor: number;
//   // private smallCircleAlpha: number;
// }
export class Joystick extends Container {
  private bigCircle: Graphics;
  private bigCircleRadius: number;
  private smallCircle: Graphics;
  private smallCircleRadius: number;

  // private playerPointer: PlayerPointer;
  constructor(options?: JoystickOption) {
    super();

    const bigCircleRadius = options?.bigCircleRadius || 50;
    const bigCircleColor = options?.bigCircleColor || 0x112222;
    const bigCircleAlpha = options?.bigCircleAlpha || 0.3;
    const smallCircleRadius = options?.smallCircleRadius || 20;
    const smallCircleColor = options?.smallCircleColor || 0x001010;
    const smallCircleAlpha = options?.smallCircleAlpha || 0.3;

    const bigCircle = this.makeCircle(
      bigCircleColor,
      bigCircleAlpha,
      bigCircleRadius,
    );
    this.bigCircleRadius = bigCircleRadius;
    this.bigCircle = bigCircle;
    this.addChild(bigCircle);

    const smallCircle = this.makeCircle(
      smallCircleColor,
      smallCircleAlpha,
      smallCircleRadius,
    );
    this.smallCircleRadius = smallCircleRadius;
    this.smallCircle = smallCircle;
    bigCircle.addChild(smallCircle);
    this.visible = false;
  }

  private makeCircle(color: number, alpha: number, radius: number): Graphics {
    const circle = new Graphics();
    circle.beginFill(color, alpha);
    circle.drawCircle(0, 0, radius);
    return circle;
  }

  public revealJoystick(posX: number, posY: number): void {
    this.position.set(posX, posY);
    this.visible = true;
  }

  public setSmallCirclePosition(diff: Vec2, length: number): void {
    console.log('Diff', length, this.bigCircleRadius - this.smallCircleRadius);
    if (!this.isOuterMost(length))
      this.smallCircle.position.set(diff.x, diff.y);
    else {
      this.smallCircle.position.set(
        (this.bigCircleRadius - this.smallCircleRadius) * (diff.x / length),
        (this.bigCircleRadius - this.smallCircleRadius) * (diff.y / length),
      );
    }
  }

  private isOuterMost(length: number) {
    return length > this.bigCircleRadius - this.smallCircleRadius;
  }
  public hideJoystick(): void {
    this.smallCircle.position.set(0);
    this.visible = false;
  }
}
