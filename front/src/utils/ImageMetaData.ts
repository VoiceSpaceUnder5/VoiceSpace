export enum AvatarImageEnum { // 무조건 여기 순서대로 입력해주세요.
  BUNNY = 0,
}

export const AvatarImageEnumMin = AvatarImageEnum.BUNNY;
export const AvatarImageEnumMax = AvatarImageEnum.BUNNY;

export enum AvatarFaceEnum { // 무조건 이 순서대로 입력해주세요
  FACE_MUTE,
  FACE_A,
  FACE_E,
  FACE_I,
  FACE_O,
  FACE_U,
}

export interface AvatarImageMD {
  avatarInitialName: string;
  avatarProfileSrc: string;
  avatarType: AvatarImageEnum;
}

export const bunnyMD: AvatarImageMD = {
  avatarType: AvatarImageEnum.BUNNY,
  avatarInitialName: 'bunny',
  avatarProfileSrc: './assets/spaceMain/avatars/bunnyFace_Mute.png',
};

export const avatarImageMDs = [bunnyMD];

export interface Formant {
  label: string;
  array: number[];
}
