import {Texture} from '@pixi/core';
import {Sprite} from '@pixi/sprite';
import {AvatarImageEnum} from '../ImageMetaData';
import {CollisionBox} from './CollisionBox';
import {DisplayContainer} from './DisplayContainer';

export interface Avatar {
  avatar: number;
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
  addCollisionBox(avatar, -15, avatar.height / 2 - 40, 30, 20);
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

export function addCollisionBox(
  parent: DisplayContainer,
  offsetX: number,
  offsetY: number,
  width: number,
  height: number,
): void {
  const collisionBox = new CollisionBox(offsetX, offsetY, width, height);
  parent.collisionBox = collisionBox;
  parent.addChild(collisionBox);
}
