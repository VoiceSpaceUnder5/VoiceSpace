export interface Key {
  code: string;
  isDown: boolean;
  isUp: boolean;
  press: () => void;
  release: () => void;
  downHandler: (event: KeyboardEvent) => void;
  upHandler: (event: KeyboardEvent) => void;
}
