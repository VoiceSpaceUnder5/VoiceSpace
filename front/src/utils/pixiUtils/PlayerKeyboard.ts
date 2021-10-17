import {MyAvatar} from './MyAvatar';
import {keyboard} from './keyboard';
import {Key} from './Key';

const SPEED = 20;

export class PlayerKeyboard {
  public left: Key;
  public right: Key;
  public up: Key;
  public down: Key;

  constructor(
    player: MyAvatar,
    leftKeyCode: string,
    rightKeyCode: string,
    upKeyCode: string,
    downKeyCode: string,
  ) {
    this.left = keyboard(leftKeyCode);
    this.right = keyboard(rightKeyCode);
    this.up = keyboard(upKeyCode);
    this.down = keyboard(downKeyCode);

    this.initialize(player);
  }

  private initialize(player: MyAvatar) {
    this.left.press = () => {
      player.vx -= SPEED;
      player.scale.x = -1;
    };

    this.left.release = () => {
      player.vx += SPEED;
    };

    this.up.press = () => {
      player.vy -= SPEED;
    };
    this.up.release = () => {
      player.vy += SPEED;
    };

    this.right.press = () => {
      player.vx += SPEED;
      player.scale.x = 1;
    };
    this.right.release = () => {
      player.vx -= SPEED;
    };

    this.down.press = () => {
      player.vy += SPEED;
    };
    this.down.release = () => {
      player.vy -= SPEED;
    };
  }
}
