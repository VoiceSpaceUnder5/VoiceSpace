import { Player } from "./Player";
import { keyboard } from "./keyboard";
import { Key } from "./Key";

const SPEED = 5;

export class PlayerKeyboard {
  public left: Key;
  public right: Key;
  public up: Key;
  public down: Key;

  constructor(player: Player) {
    this.left = keyboard("KeyA");
    this.right = keyboard("KeyD");
    this.up = keyboard("KeyW");
    this.down = keyboard("KeyS");

    this.initialize(player);
  }

  private initialize(player: Player) {
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
