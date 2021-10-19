import {Texture} from '@pixi/core';
import {Sprite} from '@pixi/sprite';
import {AvatarImageEnum, AvatarFaceEnum} from '../ImageMetaData';
import {DisplayContainer} from './DisplayContainer';
import {DisplayContainerData, PartsData} from './metaData/DataInterface';
import {ResourceManager} from './ResourceManager';

export interface Avatar {
  avatar: number;
  avatarFace: AvatarFaceEnum;
  avatarFaceScale: number;
  partRotateDegree: number[];
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

export const avatarName = ['bunny'];

export function newAvatar(
  container: DisplayContainer,
  data: DisplayContainerData,
): void {
  data.parts.forEach(part => {
    const sprite = makeSpriteFromMD(part);
    if (sprite) container.addPart(sprite);
  });
  container.addPartsToChild();
  if (data.collisionBox) container.addCollisionBox(data.collisionBox);
}

function makeSpriteFromMD(part: PartsData): Sprite | undefined {
  const texture = ResourceManager.getTexture(
    part.textureName,
    part.spriteSheet,
  );
  if (!texture) return;
  const sprite = Sprite.from(texture);
  sprite.position.set(part.position.x, part.position.y);
  sprite.anchor.set(part.anchor.x, part.anchor.y);
  return sprite;
}

export function swapFace(
  avatar: AvatarImageEnum,
  face: Sprite,
  vowel: AvatarFaceEnum,
): void {
  const faceState = [
    'Face_Mute.png',
    'Face_A.png',
    'Face_E.png',
    'Face_I.png',
    'Face_O.png',
    'Face_U.png',
  ];
  const name = avatarName[avatar];
  const texture = ResourceManager.getTexture(
    name + faceState[vowel],
    'avatars.json',
  );
  if (texture) face.texture = texture;
}

export function swapSpriteTexture(sprite: Sprite, texture: Texture): void {
  sprite.texture = texture;
}

export function setPartsPosition(avatar: DisplayContainer): void {
  avatar.parts[AvatarParts.FACE].anchor.set(0.45, 0.95);
  avatar.parts[AvatarParts.BODY].anchor.set(0.5, 0);

  avatar.parts[AvatarParts.LEFT_ARM].anchor.set(0.5, 0.2);
  avatar.parts[AvatarParts.LEFT_ARM].position.set(8, 5);

  avatar.parts[AvatarParts.LEFT_LEG].anchor.set(0.5, 0.2);
  avatar.parts[AvatarParts.LEFT_LEG].position.set(9, 42);

  avatar.parts[AvatarParts.RIGHT_ARM].anchor.set(0.5, 0.2);
  avatar.parts[AvatarParts.RIGHT_ARM].position.set(-8, 5);

  avatar.parts[AvatarParts.RIGHT_LEG].anchor.set(0.5, 0.2);
  avatar.parts[AvatarParts.RIGHT_LEG].position.set(-8, 42);
}
