export interface Vec2 {
  x: number;
  y: number;
}

export interface CollisionBoxData {
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
  position: Vec2;
  parts: PartsData[];
  collisionBox?: CollisionBoxData;
}

export interface StuffData extends DisplayContainerData {
  alphaChangable: boolean;
}

export interface AvatarData extends DisplayContainerData {
  faceTexture: string[];
}

export interface YoutubeStuffData extends StuffData {
  interactBox: CollisionBoxData;
  youtubeContainerLeftPosition: number;
  youtubeContainerTopPosition: number;
  youtubeVideoID: string;
}

export interface BackgroundData {
  textureName: string;
  width: number;
  height: number;
}

export interface WorldData {
  startPosition: Vec2;
  background: BackgroundData;
  stuffs: StuffData[];
  youtubeStuffs: YoutubeStuffData[];
}

export const PLAYER_SPEED = 8;
