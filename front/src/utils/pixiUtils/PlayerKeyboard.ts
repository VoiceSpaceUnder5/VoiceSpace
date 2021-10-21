import {MyAvatar} from './MyAvatar';
import {keyboard} from './Keyboard';
import {Key} from './Key';
import {PLAYER_SPEED} from './metaData/DataInterface';

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

  public get keyDown(): boolean {
    return (
      this.left.isDown ||
      this.right.isDown ||
      this.up.isDown ||
      this.down.isDown
    );
  }

  private initialize(player: MyAvatar) {
    this.left.press = () => {
      player.vx -= PLAYER_SPEED;
      player.scale.x = -1;
    };

    this.left.release = () => {
      player.vx += PLAYER_SPEED;
    };

    this.up.press = () => {
      player.vy -= PLAYER_SPEED;
    };
    this.up.release = () => {
      player.vy += PLAYER_SPEED;
    };

    this.right.press = () => {
      player.vx += PLAYER_SPEED;
      player.scale.x = 1;
    };
    this.right.release = () => {
      player.vx -= PLAYER_SPEED;
    };

    this.down.press = () => {
      player.vy += PLAYER_SPEED;
    };
    this.down.release = () => {
      player.vy -= PLAYER_SPEED;
    };
  }
}
