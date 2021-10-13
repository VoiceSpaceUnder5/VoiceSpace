export interface Avatar {
  avatar: number;
  partRotateDegree: number;
  rotateClockWise: boolean;
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
