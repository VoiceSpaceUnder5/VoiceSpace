import ImageInfoProvider from './ImageInfoProvider';
import {Vec2} from './RTCGameUtils';
// 파일이름은 imageInfo 지만 이 안에서 backgroundMetaData
// image src 의 주소를 따로 관리 하는 방법도 생각해 볼것.
// 여러 부분에서 참조 할 경우 위와 같이 한곳에서 관리 해야한다.

///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////// Enum And Interface Part Start ///////////////////////////
export enum ObjectCollisionFigureEnum {
  NOT_FILLED_SQUARE,
  NOT_FILLED_ELLIPSE,
  FILLED_SQUARE,
  FILLED_ELLIPSE,
}

export enum AvatarImageEnum { // 무조건 여기 순서대로 입력해주세요.
  BROWN_BEAR = 0,
  BROWN_HORSE = 1,
  WHITE_RABBIT = 2,
  PINK_PIG = 3,
  WHITE_CAT = 4,
  YELLOW_DOG = 5,
  CREAM_PANDA = 6,
  ORANGE_FOX = 7,
}

export enum AvatarPartImageEnum { // 무조건 이 순서대로 입력해주세요
  BODY = 0,
  FACE_MUTE = 1,
  FACE_SPEAK = 2,
  FACE_SPEAK_SMILE = 3,
  FACE_A = 4,
  FACE_E = 5,
  FACE_I = 6,
  FACE_O = 7,
  FACE_U = 8,
}

// 낮은 layer 부터 먼저 그려진다.
// BACKGROUND_XX -> OBSTACLE_BEFORE_AVATAR_XX -> AVATAR_XX -> OBSTACLE_AFTER_AVATAR_XX 순으로 진행.
export enum LayerLevelEnum {
  BACKGROUND_ZERO = 0,
  BACKGROUND_ONE = 1,
  OBSTACLE_BEFORE_AVATAR_ZERO = 2,
  OBSTACLE_BEFORE_AVATAR_ONE = 3,
  AVATAR_ZERO = 4,
  AVATAR_ONE = 5,
  AVATAR_TWO = 6,
  AVATAR_THREE = 7,
  OBSTACLE_AFTER_AVATAR_ZERO = 8,
  OBSTACLE_AFTER_AVATAR_ONE = 9,
}

export interface PixelData {
  imageInfoKey: number;
  collisionInfoKey: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface ImageMDInfo {
  // MD: MedaData
  src: string; // image file 이 저장되어있는 상대주소. 상대주소의 시작은 public 폴더.
  centerPosPixelOffset: Vec2; // 이미지 정보가 로드되어 그림이 그려질때, 그리려고 하는 위치의 centerPosition 에서 얼만큼 떨어져야 하는지
  layerLev: LayerLevelEnum; // 몇번째 층에 그려져야 하는지 (0 ~ 9) // 낮은 레벨일수록 먼저 그려짐
}

export interface AvatarMDInfo extends ImageMDInfo {
  partType: AvatarPartImageEnum;
}

// ImageMDInfo 를 기반으로 만들어진 tex 와 image의 size 등 직접 glHelper 에서 draw 할때 사용할 수 있는
// 정보를 담고 있음.
export interface ImageInfo {
  centerPosPixelOffset: Vec2;
  tex: WebGLTexture;
  size: Size;
  centerPos: Vec2;
}

export interface CollisionMDInfo {
  collisionType: ObjectCollisionFigureEnum;
  centerPosPixelOffset: Vec2;
  size: Size;
}

export interface ObjectImageMD {
  imageMDInfos: ImageMDInfo[];
  collisionMDInfos: CollisionMDInfo[];
}

/**
 * ## 몸통, 얼굴 Y축 offset 계산법
 * 피그마 디자인 길이 참조
 * - 세트 절반 : 세트 height / 2
 * - 몸통 절반 : 몸통 height / 2
 * - 얼굴 절반 : 얼굴 height / 2
 * ### 몸통 Y 오프셋 값
 * 몸통 절반 - 세트 절반
 * ### 얼굴 Y 오프셋 값
 * 세트 절반 - 얼굴 절반
 */
export interface AvatarImageMD {
  avatarMDInfos: AvatarMDInfo[];
  avatarType: AvatarImageEnum;
  avatarInitialName: string;
}

export interface MapMakingInfo {
  backgroundSize: Size;
  respawnPosition: Vec2;
  makingFunc: (arg0: ImageInfoProvider) => void;
}

///////////////////////////// Enum And Interface Part End /////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

// MapMakerInfo
export const seaAndMountainMap1MMI: MapMakingInfo = {
  backgroundSize: {width: 2400, height: 2400},
  respawnPosition: {x: 1200, y: 1200},
  makingFunc: (imageInfoProvider: ImageInfoProvider) => {
    // 이런식으론 안해도 될것 같은데... 그냥 makeFunc: ImageInfoProvider.prototype.makeWorldMap1 이런식으로 입력하면 테스트가 안돌아감 ㅠㅠ 망할 jest
    const func =
      ImageInfoProvider.prototype.makeWorldMap1.bind(imageInfoProvider);
    func();
  },
};

/////////////////////////////////////////////////////////////////////////////////
/////////////////////////// ImageMetaData Part Start ////////////////////////////
export const seaAndMountainVer1MD: ObjectImageMD = {
  imageMDInfos: [
    {
      src: './assets/spaceMain/background/seaAndMountainVer1.png',
      centerPosPixelOffset: {x: 0, y: 0},
      layerLev: LayerLevelEnum.BACKGROUND_ZERO,
    },
  ],
  collisionMDInfos: [
    {
      collisionType: ObjectCollisionFigureEnum.NOT_FILLED_SQUARE,
      size: {width: 2400, height: 2400},
      centerPosPixelOffset: {x: 0, y: 0},
    },
  ],
};

export const seaAndMountainVer2MD: ObjectImageMD = {
  imageMDInfos: [
    {
      src: './assets/spaceMain/background/seaAndMountainVer2.png',
      centerPosPixelOffset: {x: 0, y: 0},
      layerLev: LayerLevelEnum.BACKGROUND_ZERO,
    },
  ],
  collisionMDInfos: [
    {
      collisionType: ObjectCollisionFigureEnum.NOT_FILLED_SQUARE,
      size: {width: 2400, height: 2400},
      centerPosPixelOffset: {x: 0, y: 0},
    },
  ],
};

// bigTree unionSize = 352 x 440 (x4 ratio)
export const bigTreeMD: ObjectImageMD = {
  imageMDInfos: [
    {
      src: './assets/spaceMain/object/bigTreeTop.png',
      centerPosPixelOffset: {x: 0, y: -(440 / 2 - 324 / 2)},
      layerLev: LayerLevelEnum.OBSTACLE_AFTER_AVATAR_ZERO, // 동물 친구들 이후로 그려지는 것들중 가장 먼저 그려짐.
    },
    {
      src: './assets/spaceMain/object/bigTreeBottom.png',
      centerPosPixelOffset: {x: 0, y: +(440 / 2 - 240 / 2)},
      layerLev: LayerLevelEnum.OBSTACLE_BEFORE_AVATAR_ONE,
    },
  ],
  collisionMDInfos: [
    {
      collisionType: ObjectCollisionFigureEnum.FILLED_ELLIPSE,
      centerPosPixelOffset: {x: 0, y: 100},
      size: {width: 160, height: 128},
    },
  ],
};

// smallTree unionSize = 264 * 300 (x3 ratio)
// top :146 * 210
// bottom:264 * 180
export const smallTreeMD: ObjectImageMD = {
  imageMDInfos: [
    {
      src: './assets/spaceMain/object/smallTreeTop.png',
      centerPosPixelOffset: {x: 0, y: -(300 / 2 - 210 / 2)},
      layerLev: LayerLevelEnum.OBSTACLE_AFTER_AVATAR_ZERO, // 동물 친구들 이후로 그려지는 것들중 가장 먼저 그려짐.
    },
    {
      src: './assets/spaceMain/object/smallTreeBottom.png',
      centerPosPixelOffset: {x: 0, y: +(300 / 2 - 180 / 2)},
      layerLev: LayerLevelEnum.OBSTACLE_BEFORE_AVATAR_ONE,
    },
  ],
  collisionMDInfos: [
    {
      collisionType: ObjectCollisionFigureEnum.FILLED_ELLIPSE,
      centerPosPixelOffset: {x: 0, y: 60},
      size: {width: 120, height: 84},
    },
  ],
};

export const greenGrassMD: ObjectImageMD = {
  imageMDInfos: [
    {
      src: './assets/spaceMain/object/greenGrass.png',
      centerPosPixelOffset: {x: 0, y: 0},
      layerLev: LayerLevelEnum.OBSTACLE_BEFORE_AVATAR_ZERO,
    },
  ],
  collisionMDInfos: [],
};

export const grayBlockMD: ObjectImageMD = {
  imageMDInfos: [
    {
      src: './assets/spaceMain/object/grayBlock.png',
      centerPosPixelOffset: {x: 0, y: 0},
      layerLev: LayerLevelEnum.OBSTACLE_AFTER_AVATAR_ZERO,
    },
  ],
  collisionMDInfos: [
    {
      collisionType: ObjectCollisionFigureEnum.FILLED_SQUARE,
      centerPosPixelOffset: {x: 0, y: 0},
      size: {width: 72, height: 72},
    },
  ],
};

//////////////////////////////// AvatarSizeInfo /////////////////////////////////
export const brownBearMD: AvatarImageMD = {
  avatarType: AvatarImageEnum.BROWN_BEAR,
  avatarInitialName: '갈색 곰',
  avatarMDInfos: [
    {
      src: './assets/spaceMain/avatar/brownBearBody.png',
      centerPosPixelOffset: {
        x: 0,
        y: -33,
      },
      layerLev: LayerLevelEnum.AVATAR_ZERO,
      partType: AvatarPartImageEnum.BODY,
    },
    {
      src: './assets/spaceMain/avatar/brownBearFaceMute.png',
      centerPosPixelOffset: {
        x: 0,
        y: 25,
      },
      layerLev: LayerLevelEnum.AVATAR_ONE,
      partType: AvatarPartImageEnum.FACE_MUTE,
    },
    {
      src: './assets/spaceMain/avatar/brownBearFaceSpeak.png',
      centerPosPixelOffset: {
        x: 0,
        y: 25,
      },
      layerLev: LayerLevelEnum.AVATAR_ONE,
      partType: AvatarPartImageEnum.FACE_SPEAK,
    },
    {
      src: './assets/spaceMain/avatar/brownBearFaceSpeakSmile.png',
      centerPosPixelOffset: {
        x: 0,
        y: 25,
      },
      layerLev: LayerLevelEnum.AVATAR_ONE,
      partType: AvatarPartImageEnum.FACE_SPEAK_SMILE,
    },
    {
      src: './assets/vowel/A.png',
      centerPosPixelOffset: {
        x: 0,
        y: 25,
      },
      layerLev: LayerLevelEnum.AVATAR_ONE,
      partType: AvatarPartImageEnum.FACE_A,
    },
    {
      src: './assets/vowel/E.png',
      centerPosPixelOffset: {
        x: 0,
        y: 25,
      },
      layerLev: LayerLevelEnum.AVATAR_ONE,
      partType: AvatarPartImageEnum.FACE_E,
    },
    {
      src: './assets/vowel/I.png',
      centerPosPixelOffset: {
        x: 0,
        y: 25,
      },
      layerLev: LayerLevelEnum.AVATAR_ONE,
      partType: AvatarPartImageEnum.FACE_I,
    },
    {
      src: './assets/vowel/O.png',
      centerPosPixelOffset: {
        x: 0,
        y: 25,
      },
      layerLev: LayerLevelEnum.AVATAR_ONE,
      partType: AvatarPartImageEnum.FACE_O,
    },
    {
      src: './assets/vowel/U.png',
      centerPosPixelOffset: {
        x: 0,
        y: 25,
      },
      layerLev: LayerLevelEnum.AVATAR_ONE,
      partType: AvatarPartImageEnum.FACE_U,
    },
  ],
};

export const brownHorseMD: AvatarImageMD = {
  avatarType: AvatarImageEnum.BROWN_HORSE,
  avatarInitialName: '갈색 말',
  avatarMDInfos: [
    {
      src: './assets/spaceMain/avatar/brownHorseBody.png',
      centerPosPixelOffset: {
        x: 0,
        y: -40,
      },
      layerLev: LayerLevelEnum.AVATAR_ZERO,
      partType: AvatarPartImageEnum.BODY,
    },
    {
      src: './assets/spaceMain/avatar/brownHorseFaceMute.png',
      centerPosPixelOffset: {
        x: 0,
        y: 12,
      },
      layerLev: LayerLevelEnum.AVATAR_ONE,
      partType: AvatarPartImageEnum.FACE_MUTE,
    },
    {
      src: './assets/spaceMain/avatar/brownHorseFaceSpeak.png',
      centerPosPixelOffset: {
        x: 0,
        y: 12,
      },
      layerLev: LayerLevelEnum.AVATAR_ONE,
      partType: AvatarPartImageEnum.FACE_SPEAK,
    },
    {
      src: './assets/spaceMain/avatar/brownHorseFaceSpeakSmile.png',
      centerPosPixelOffset: {
        x: 0,
        y: 12,
      },
      layerLev: LayerLevelEnum.AVATAR_ONE,
      partType: AvatarPartImageEnum.FACE_SPEAK_SMILE,
    },
  ],
};

export const whiteRabbitMD: AvatarImageMD = {
  avatarType: AvatarImageEnum.WHITE_RABBIT,
  avatarInitialName: '하얀 토끼',
  avatarMDInfos: [
    {
      src: './assets/spaceMain/avatar/whiteRabbitBody.png',
      centerPosPixelOffset: {
        x: 0,
        y: -36,
      },
      layerLev: LayerLevelEnum.AVATAR_ZERO,
      partType: AvatarPartImageEnum.BODY,
    },
    {
      src: './assets/spaceMain/avatar/whiteRabbitFaceMute.png',
      centerPosPixelOffset: {
        x: 0,
        y: 8,
      },
      layerLev: LayerLevelEnum.AVATAR_ONE,
      partType: AvatarPartImageEnum.FACE_MUTE,
    },
    {
      src: './assets/spaceMain/avatar/whiteRabbitFaceSpeak.png',
      centerPosPixelOffset: {
        x: 0,
        y: 8,
      },
      layerLev: LayerLevelEnum.AVATAR_ONE,
      partType: AvatarPartImageEnum.FACE_SPEAK,
    },
    {
      src: './assets/spaceMain/avatar/whiteRabbitFaceSpeakSmile.png',
      centerPosPixelOffset: {
        x: 0,
        y: 8,
      },
      layerLev: LayerLevelEnum.AVATAR_ONE,
      partType: AvatarPartImageEnum.FACE_SPEAK_SMILE,
    },
  ],
};

export const pinkPigMD: AvatarImageMD = {
  avatarType: AvatarImageEnum.PINK_PIG,
  avatarInitialName: '분홍 돼지',
  avatarMDInfos: [
    {
      src: './assets/spaceMain/avatar/pinkPigBody.png',
      centerPosPixelOffset: {
        x: 0,
        y: -44,
      },
      layerLev: LayerLevelEnum.AVATAR_ZERO,
      partType: AvatarPartImageEnum.BODY,
    },
    {
      src: './assets/spaceMain/avatar/pinkPigFaceMute.png',
      centerPosPixelOffset: {
        x: 0,
        y: 28,
      },
      layerLev: LayerLevelEnum.AVATAR_ONE,
      partType: AvatarPartImageEnum.FACE_MUTE,
    },
    {
      src: './assets/spaceMain/avatar/pinkPigFaceSpeak.png',
      centerPosPixelOffset: {
        x: 0,
        y: 28,
      },
      layerLev: LayerLevelEnum.AVATAR_ONE,
      partType: AvatarPartImageEnum.FACE_SPEAK,
    },
    {
      src: './assets/spaceMain/avatar/pinkPigFaceSpeakSmile.png',
      centerPosPixelOffset: {
        x: 0,
        y: 28,
      },
      layerLev: LayerLevelEnum.AVATAR_ONE,
      partType: AvatarPartImageEnum.FACE_SPEAK_SMILE,
    },
  ],
};

export const whiteCatMD: AvatarImageMD = {
  avatarType: AvatarImageEnum.WHITE_CAT,
  avatarInitialName: '하얀 고양이',
  avatarMDInfos: [
    {
      src: './assets/spaceMain/avatar/whiteCatBody.png',
      centerPosPixelOffset: {
        x: 0,
        y: -41,
      },
      layerLev: LayerLevelEnum.AVATAR_ZERO,
      partType: AvatarPartImageEnum.BODY,
    },
    {
      src: './assets/spaceMain/avatar/whiteCatFaceMute.png',
      centerPosPixelOffset: {
        x: 0,
        y: 27,
      },
      layerLev: LayerLevelEnum.AVATAR_ONE,
      partType: AvatarPartImageEnum.FACE_MUTE,
    },
    {
      src: './assets/spaceMain/avatar/whiteCatFaceSpeak.png',
      centerPosPixelOffset: {
        x: 0,
        y: 27,
      },
      layerLev: LayerLevelEnum.AVATAR_ONE,
      partType: AvatarPartImageEnum.FACE_SPEAK,
    },
    {
      src: './assets/spaceMain/avatar/whiteCatFaceSpeakSmile.png',
      centerPosPixelOffset: {
        x: 0,
        y: 27,
      },
      layerLev: LayerLevelEnum.AVATAR_ONE,
      partType: AvatarPartImageEnum.FACE_SPEAK_SMILE,
    },
  ],
};

export const yellowDogMD: AvatarImageMD = {
  avatarType: AvatarImageEnum.YELLOW_DOG,
  avatarInitialName: '노란 강아지',
  avatarMDInfos: [
    {
      src: './assets/spaceMain/avatar/yellowDogBody.png',
      centerPosPixelOffset: {
        x: 0,
        y: -38,
      },
      layerLev: LayerLevelEnum.AVATAR_ZERO,
      partType: AvatarPartImageEnum.BODY,
    },
    {
      src: './assets/spaceMain/avatar/yellowDogFaceMute.png',
      centerPosPixelOffset: {
        x: 0,
        y: 30,
      },
      layerLev: LayerLevelEnum.AVATAR_ONE,
      partType: AvatarPartImageEnum.FACE_MUTE,
    },
    {
      src: './assets/spaceMain/avatar/yellowDogFaceSpeak.png',
      centerPosPixelOffset: {
        x: 0,
        y: 30,
      },
      layerLev: LayerLevelEnum.AVATAR_ONE,
      partType: AvatarPartImageEnum.FACE_SPEAK,
    },
    {
      src: './assets/spaceMain/avatar/yellowDogFaceSpeakSmile.png',
      centerPosPixelOffset: {
        x: 0,
        y: 30,
      },
      layerLev: LayerLevelEnum.AVATAR_ONE,
      partType: AvatarPartImageEnum.FACE_SPEAK_SMILE,
    },
  ],
};

export const creamPandaMD: AvatarImageMD = {
  avatarType: AvatarImageEnum.CREAM_PANDA,
  avatarInitialName: '크림 판다',
  avatarMDInfos: [
    {
      src: './assets/spaceMain/avatar/creamPandaBody.png',
      centerPosPixelOffset: {
        x: 0,
        y: -44,
      },
      layerLev: LayerLevelEnum.AVATAR_ZERO,
      partType: AvatarPartImageEnum.BODY,
    },
    {
      src: './assets/spaceMain/avatar/creamPandaFaceMute.png',
      centerPosPixelOffset: {
        x: 0,
        y: 36,
      },
      layerLev: LayerLevelEnum.AVATAR_ONE,
      partType: AvatarPartImageEnum.FACE_MUTE,
    },
    {
      src: './assets/spaceMain/avatar/creamPandaFaceSpeak.png',
      centerPosPixelOffset: {
        x: 0,
        y: 36,
      },
      layerLev: LayerLevelEnum.AVATAR_ONE,
      partType: AvatarPartImageEnum.FACE_SPEAK,
    },
    {
      src: './assets/spaceMain/avatar/creamPandaFaceSpeakSmile.png',
      centerPosPixelOffset: {
        x: 0,
        y: 36,
      },
      layerLev: LayerLevelEnum.AVATAR_ONE,
      partType: AvatarPartImageEnum.FACE_SPEAK_SMILE,
    },
  ],
};

export const orangeFoxMD: AvatarImageMD = {
  avatarType: AvatarImageEnum.ORANGE_FOX,
  avatarInitialName: '주황 여우',
  avatarMDInfos: [
    {
      src: './assets/spaceMain/avatar/orangeFoxBody.png',
      centerPosPixelOffset: {
        x: 0,
        y: -28,
      },
      layerLev: LayerLevelEnum.AVATAR_ZERO,
      partType: AvatarPartImageEnum.BODY,
    },
    {
      src: './assets/spaceMain/avatar/orangeFoxFaceMute.png',
      centerPosPixelOffset: {
        x: 0,
        y: 48,
      },
      layerLev: LayerLevelEnum.AVATAR_ONE,
      partType: AvatarPartImageEnum.FACE_MUTE,
    },
    {
      src: './assets/spaceMain/avatar/orangeFoxFaceSpeak.png',
      centerPosPixelOffset: {
        x: 0,
        y: 48,
      },
      layerLev: LayerLevelEnum.AVATAR_ONE,
      partType: AvatarPartImageEnum.FACE_SPEAK,
    },
    {
      src: './assets/spaceMain/avatar/orangeFoxFaceSpeakSmile.png',
      centerPosPixelOffset: {
        x: 0,
        y: 48,
      },
      layerLev: LayerLevelEnum.AVATAR_ONE,
      partType: AvatarPartImageEnum.FACE_SPEAK_SMILE,
    },
  ],
};

export const avatarImageMDs = [
  brownBearMD,
  brownHorseMD,
  whiteRabbitMD,
  pinkPigMD,
  whiteCatMD,
  yellowDogMD,
  creamPandaMD,
  orangeFoxMD,
];

export interface Formant {
  label: string;
  array: number[];
  Image: HTMLImageElement | null;
}
