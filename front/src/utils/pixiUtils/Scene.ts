import { DisplayObject } from "@pixi/display";

export interface Scene extends DisplayObject {
  update(framesPassed: number): void;

  // we added the resize method to the interface
  resize(screenWidth: number, screenHeight: number): void;
}
