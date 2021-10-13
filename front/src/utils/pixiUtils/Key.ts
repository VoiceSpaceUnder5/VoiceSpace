export interface Key {
  code: string;
  isDown: boolean;
  isUp: boolean;
  press: Function;
  release: Function;
  downHandler: (event: KeyboardEvent) => void;
  upHandler: (event: KeyboardEvent) => void;
}
