//The `keyboard` helper function
import {Key} from './Key';

export function keyboard(keyCode: string): Key {
  const key: Key = {
    code: keyCode,
    isDown: false,
    isUp: true,
    press: () => {
      return;
    },
    release: () => {
      return;
    },
    //keyDown handler
    downHandler: (event: KeyboardEvent) => {
      if (isTyping()) return;
      if (event.code === key.code) {
        if (key.isUp && key.press) {
          key.press();
        }
        key.isDown = true;
        key.isUp = false;
      }
      // event.preventDefault();
    },
    //keyUp handler
    upHandler: (event: KeyboardEvent) => {
      if (isTyping()) return;
      if (event.code === key.code) {
        if (key.isDown && key.release) {
          key.release();
        }
        key.isDown = false;
        key.isUp = true;
      }
      // event.preventDefault();
    },
  };
  //Attach event listeners
  window.addEventListener('keydown', key.downHandler.bind(key), false);
  window.addEventListener('keyup', key.upHandler.bind(key), false);
  return key;
}

export function isTyping(): boolean {
  if (document.activeElement?.tagName === 'INPUT') return true;
  return false;
}
