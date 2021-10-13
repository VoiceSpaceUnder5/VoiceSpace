//The `keyboard` helper function
import { Key } from "./Key";

export function keyboard(keyCode: string) {
  const key: Key = {
    code: keyCode,
    isDown: false,
    isUp: true,
    press: undefined,
    release: undefined,
    //keyDown handler
    downHandler: (event: KeyboardEvent) => {
      if (event.code === key.code) {
        if (key.isUp && key.press) {
          key.press();
        }
        key.isDown = true;
        key.isUp = false;
      }
      event.preventDefault();
    },
    //keyUp handler
    upHandler: (event) => {
      if (event.code === key.code) {
        if (key.isDown && key.release) {
          key.release();
        }
        key.isDown = false;
        key.isUp = true;
      }
      event.preventDefault();
    },
  };

  //Attach event listeners
  window.addEventListener("keydown", key.downHandler.bind(key), false);
  window.addEventListener("keyup", key.upHandler.bind(key), false);
  return key;
}
