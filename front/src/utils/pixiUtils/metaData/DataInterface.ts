export interface Vec2 {
  x: number;
  y: number;
}

export interface collisionBoxData {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PartsData {
  name?: string;
  spriteSheet?: string;
  textureName: string;
  position: Vec2;
  anchor: Vec2;
}

export interface DisplayContainerData {
  position?: Vec2;
  parts: PartsData[];
  collisionBox?: collisionBoxData;
  faceTexture?: string[];
  alphaChangable?: boolean;
}

export interface BackgroundData {
  textureName: string;
  width: number;
  height: number;
}

export interface WorldData {
  startPosition: Vec2;
  background: BackgroundData;
  stuffs: DisplayContainerData[];
}

export const PLAYER_SPEED = 8;
