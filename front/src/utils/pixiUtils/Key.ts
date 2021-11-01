export class Key {
  private code: string;
  public isDown: boolean;
  public isUp: boolean;
  private press?: () => void;
  private release?: () => void;

  constructor(keyCode: string) {
    this.code = keyCode;
    this.isDown = false;
    this.isUp = true;

    window.addEventListener('keydown', this.downHandler.bind(this), false);
    window.addEventListener('keyup', this.upHandler.bind(this), false);
  }

  private upHandler(event: KeyboardEvent): void {
    if (this.isUp && isTyping()) return;
    if (event.code === this.code) {
      if (this.isDown && this.release) {
        this.release();
      }
      this.isDown = false;
      this.isUp = true;
    }
    // event.preventDefault();
  }

  private downHandler(event: KeyboardEvent): void {
    if (isTyping()) return;
    if (event.code === this.code) {
      if (this.isUp && this.press) {
        this.press();
      }
      this.isDown = true;
      this.isUp = false;
    }
    // event.preventDefault();
  }

  public setPress(pressCall: () => void): void {
    this.press = pressCall;
  }

  public setRelease(releaseCall: () => void): void {
    this.release = releaseCall;
  }

  public reset(): void {
    this.isDown = false;
    this.isUp = true;
  }
}

export function isTyping(): boolean {
  if (document.activeElement?.tagName === 'INPUT') return true;
  return false;
}
