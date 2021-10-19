import {Texture} from '@pixi/core';
import {Sprite} from '@pixi/sprite';
import {AvatarImageEnum, AvatarPartImageEnum} from '../ImageMetaData';
import {DisplayContainer} from './DisplayContainer';
import {ResourceManager} from './ResourceManager';

export interface Avatar {
  avatar: number;
  avatarFace: AvatarPartImageEnum;
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

interface AvatarPartsMD {
  name: string;
  spritesheet: string;
  textureName: string;
  position: {x: number; y: number};
  anchor: {x: number; y: number};
}

interface AvatarMD {
  parts: AvatarPartsMD[];
  collisionBox: {x: number; y: number; width: number; height: number} | null;
}

export const PARTS_ROTATE_SPEED = 2;

export const avatarName = ['bunny'];
export function newAvatar(
  avatar: DisplayContainer,
  avatarEnum: AvatarImageEnum,
): void {
  const partsTextureNames = [
    avatarName[avatarEnum] + 'Arm',
    avatarName[avatarEnum] + 'Arm',
    avatarName[avatarEnum] + 'Body',
    avatarName[avatarEnum] + 'Arm',
    avatarName[avatarEnum] + 'Arm',
    avatarName[avatarEnum] + 'FaceMute',
  ];

  avatar.addParts(partsTextureNames);

  avatar.parts.forEach(part => {
    avatar.addChild(part);
  });

  setPartsPosition(avatar);
  avatar.addCollisionBox(-15, avatar.height / 2 - 40, 30, 20);
}

export function newAvatar2(
  container: DisplayContainer,
  avatarMD: AvatarMD,
): void {
  avatarMD.parts.forEach(part => {
    const sprite = makeSpriteFromMD(part);
    if (sprite) container.addPart(sprite);
  });
  container.addPartsToChild();
  const box = avatarMD.collisionBox;
  if (box) container.addCollisionBox(box.x, box.y, box.width, box.height);
}

function makeSpriteFromMD(part: AvatarPartsMD): Sprite | undefined {
  const texture = ResourceManager.getTextureFromSheet(
    part.textureName,
    part.spritesheet,
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
  vowel: AvatarPartImageEnum,
): void {
  const faceState = [
    'Face_Mute.png',
    'Face_A.png',
    'Face_E.png',
    'Face_I.png',
    'Face_O.png',
    'Face_U.png',
  ];
  let index = vowel - 7;
  if (index < 0) index = 0;
  const name = avatarName[avatar];
  const texture = ResourceManager.getTextureFromSheet(
    name + faceState[index],
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
