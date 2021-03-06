export enum AvatarImageEnum { // 무조건 여기 순서대로 입력해주세요.
  BUNNY,
  COW,
  PIG,
  HYEONKIM,
  CAT,
  MOUSE,
  SHEEP,
}

export const AvatarImageEnumMin = AvatarImageEnum.BUNNY;
export const AvatarImageEnumMax = AvatarImageEnum.SHEEP;

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

export const cowMD: AvatarImageMD = {
  avatarType: AvatarImageEnum.COW,
  avatarInitialName: 'cow',
  avatarProfileSrc: './assets/spaceMain/avatars/cowFace_Mute.png',
};

export const pigMD: AvatarImageMD = {
  avatarType: AvatarImageEnum.PIG,
  avatarInitialName: 'pig',
  avatarProfileSrc: './assets/spaceMain/avatars/pigFace_Mute.png',
};

export const hyeonkimMD: AvatarImageMD = {
  avatarType: AvatarImageEnum.HYEONKIM,
  avatarInitialName: 'hyeonkim',
  avatarProfileSrc: './assets/spaceMain/avatars/hyeonkimFace_Mute.png',
};

export const catMD: AvatarImageMD = {
  avatarType: AvatarImageEnum.CAT,
  avatarInitialName: 'cat',
  avatarProfileSrc: './assets/spaceMain/avatars/catFace_Mute.png',
};

export const mouseMD: AvatarImageMD = {
  avatarType: AvatarImageEnum.MOUSE,
  avatarInitialName: 'mouse',
  avatarProfileSrc: './assets/spaceMain/avatars/mouseFace_Mute.png',
};

export const sheepMD: AvatarImageMD = {
  avatarType: AvatarImageEnum.SHEEP,
  avatarInitialName: 'sheep',
  avatarProfileSrc: './assets/spaceMain/avatars/sheepFace_Mute.png',
};

export const avatarImageMDs = [
  bunnyMD,
  cowMD,
  pigMD,
  hyeonkimMD,
  catMD,
  mouseMD,
  sheepMD,
];

export interface Formant {
  label: string;
  array: number[];
}
