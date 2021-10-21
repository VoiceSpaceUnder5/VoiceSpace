import {Sprite} from '@pixi/sprite';
import {Viewport} from 'pixi-viewport';
import {
  AvatarImageEnum,
  AvatarFaceEnum,
  avatarImageMDs,
} from './metaData/ImageMetaData';
import {DisplayContainer} from './DisplayContainer';
import {AvatarData, DisplayContainerData} from './metaData/DataInterface';
import {ResourceManager} from './ResourceManager';
import {World} from './World';

const avatarMDs = require('./metaData/avatars.json');

export interface IAvatar {
  avatarImageEnum: AvatarImageEnum;
  avatarFace: AvatarFaceEnum;
  avatarFaceScale: number;
  faceTexture: string[];
  partRotateDegree: number[];
  viewport: Viewport;
}

export enum AvatarParts {
  LEFT_ARM,
  LEFT_LEG,
  BODY,
  RIGHT_ARM,
  RIGHT_LEG,
  FACE,
}

export const PARTS_ROTATE_SPEED = 2;

export class Avatar extends DisplayContainer implements IAvatar {
  public avatarImageEnum: AvatarImageEnum;
  public avatarFace: AvatarFaceEnum;
  public avatarFaceScale: number;
  public faceTexture: string[];
  public partRotateDegree: number[];
  public viewport: Viewport;

  constructor(world: World, viewport: Viewport) {
    super(world);

    this.avatarImageEnum = AvatarImageEnum.BUNNY;
    this.avatarFace = AvatarFaceEnum.FACE_MUTE;
    this.avatarFaceScale = 1.0;
    this.partRotateDegree = Array.from({length: 6}, () => 0);
    this.position.copyFrom(world.startPosition);
    this.viewport = viewport;
    this.faceTexture = [];
  }

  public setAvatar(avatarImageEnum: AvatarImageEnum): void {
    this.avatarImageEnum = avatarImageEnum;
    this.changeAvatar(this.getAvatarMD());
  }

  protected getAvatarMD(): AvatarData {
    const avatarName = this.getAvatarInitialName();
    return avatarMDs[avatarName];
  }

  private getAvatarInitialName(): string {
    return avatarImageMDs[this.avatarImageEnum].avatarInitialName;
  }

  public changeAvatar(data: DisplayContainerData): void {
    const newParts: Sprite[] = [];
    data.parts.forEach(part => {
      const sprite = this.makeSpriteFromPartsMD(part);
      if (sprite) newParts.push(sprite);
    });
    const faceTexture = this.getAvatarMD().faceTexture;
    if (faceTexture) this.faceTexture = faceTexture;
    this.removeChildren();
    this.parts = newParts;
    this.addPartsToChild();
    if (data.collisionBox) this.addCollisionBox(data.collisionBox);
  }

  public swapFace(): void {
    const textureName = this.faceTexture[this.avatarFace];
    const face = this.children[AvatarParts.FACE] as Sprite;
    const texture = ResourceManager.getTexture(textureName, 'avatars.json');
    if (texture) face.texture = texture;
  }
}
