export interface Avatar {
  avatar: number;
  partRotateDegree: number;
}

export enum AvatarParts {
  LEFT_ARM,
  LEFT_LEG,
  BODY,
  RIGHT_ARM,
  RIGHT_LEG,
  HEAD,
}

export const PARTS_ROTATE_SPEED = 2;

export const avatarName = ['bunny'];
