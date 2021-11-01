import {MyAvatar} from './MyAvatar';
import {Key} from './Key';
import {PLAYER_SPEED} from './metaData/DataInterface';

export class PlayerKeyboard {
  public player: MyAvatar;
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
    this.player = player;
    this.left = new Key(leftKeyCode);
    this.right = new Key(rightKeyCode);
    this.up = new Key(upKeyCode);
    this.down = new Key(downKeyCode);

    this.initialize(player);
    window.addEventListener('blur', this.reset.bind(this), false);
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
    this.left.setPress(() => {
      player.vx -= PLAYER_SPEED;
      player.scale.x = -1;
    });

    this.left.setRelease(() => {
      player.vx += PLAYER_SPEED;
    });

    this.up.setPress(() => {
      player.vy -= PLAYER_SPEED;
    });
    this.up.setRelease(() => {
      player.vy += PLAYER_SPEED;
    });

    this.right.setPress(() => {
      player.vx += PLAYER_SPEED;
      player.scale.x = 1;
    });
    this.right.setRelease(() => {
      player.vx -= PLAYER_SPEED;
    });

    this.down.setPress(() => {
      player.vy += PLAYER_SPEED;
    });

    this.down.setRelease(() => {
      player.vy -= PLAYER_SPEED;
    });
  }

  public reset(): void {
    this.left.reset();
    this.right.reset();
    this.up.reset();
    this.down.reset();
    this.player.vx = 0;
    this.player.vy = 0;
  }
}
