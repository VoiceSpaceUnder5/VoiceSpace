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
  WHITE_RABBIT = 0,
}

export enum AvatarPartImageEnum { // 무조건 이 순서대로 입력해주세요
  RIGHT_ARM = 0,
  RIGHT_LEG = 1,
  BODY = 2,
  LEFT_ARM = 3,
  LEFT_LEG = 4,
  FACE_MUTE = 5,
  FACE_A = 8,
  FACE_E = 9,
  FACE_I = 10,
  FACE_O = 11,
  FACE_U = 12,
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

export const BodySize = {
  armLegSize: {x: 11, y: 28},
  armOffsetY: 47,
};

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
export const forestMapMMI: MapMakingInfo = {
  backgroundSize: {width: 3072, height: 3072},
  respawnPosition: {x: 1536, y: 1536},
  makingFunc: (imageInfoProvider: ImageInfoProvider) => {
    // 이런식으론 안해도 될것 같은데... 그냥 makeFunc: ImageInfoProvider.prototype.makeWorldMap1 이런식으로 입력하면 테스트가 안돌아감 ㅠㅠ 망할 jest
    const func =
      ImageInfoProvider.prototype.makeWorldMap1.bind(imageInfoProvider);
    func();
  },
};

/////////////////////////////////////////////////////////////////////////////////
/////////////////////////// ImageMetaData Part Start ////////////////////////////
export const forestVer1MD: ObjectImageMD = {
  imageMDInfos: [
    {
      src: './assets/spaceMain/background/forestVer1.png',
      centerPosPixelOffset: {x: 0, y: 0},
    },
  ],
  collisionMDInfos: [
    {
      collisionType: ObjectCollisionFigureEnum.NOT_FILLED_SQUARE,
      size: {width: 3072, height: 3072},
      centerPosPixelOffset: {x: 0, y: 0},
    },
  ],
};

export const seaAndMountainVer2MD: ObjectImageMD = {
  imageMDInfos: [
    {
      src: './assets/spaceMain/background/seaAndMountainVer2.png',
      centerPosPixelOffset: {x: 0, y: 0},
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

// evergreenTree unionSize = 532 x 540 (x1 ratio)
export const evergreenTreeMD: ObjectImageMD = {
  imageMDInfos: [
    {
      src: './assets/spaceMain/object/evergreenTree.png',
      centerPosPixelOffset: {x: 0, y: 0},
    },
  ],
  collisionMDInfos: [
    {
      collisionType: ObjectCollisionFigureEnum.FILLED_ELLIPSE,
      centerPosPixelOffset: {x: 0, y: 270 - 22},
      size: {width: 160, height: 8},
    },
  ],
};

// mapleTree unionSize = 496 x 480 (x1 ratio)
export const mapleTreeMD: ObjectImageMD = {
  imageMDInfos: [
    {
      src: './assets/spaceMain/object/mapleTree.png',
      centerPosPixelOffset: {x: 0, y: 0},
    },
  ],
  collisionMDInfos: [
    {
      collisionType: ObjectCollisionFigureEnum.FILLED_ELLIPSE,
      centerPosPixelOffset: {x: 0, y: 240 - 22},
      size: {width: 140, height: 8},
    },
  ],
};

// fallenLeave = 356 * 104
export const fallenLeavesMD: ObjectImageMD = {
  imageMDInfos: [
    {
      src: './assets/spaceMain/object/fallenLeaves.png',
      centerPosPixelOffset: {x: 0, y: 0},
    },
  ],
  collisionMDInfos: [],
};

export const greenGrassMD: ObjectImageMD = {
  imageMDInfos: [
    {
      src: './assets/spaceMain/object/greenGrass.png',
      centerPosPixelOffset: {x: 0, y: 0},
    },
  ],
  collisionMDInfos: [],
};

// 100 * 56
export const grassVer1MD: ObjectImageMD = {
  imageMDInfos: [
    {
      src: './assets/spaceMain/object/grassVer1.png',
      centerPosPixelOffset: {x: 0, y: 0},
    },
  ],
  collisionMDInfos: [],
};

// 92 * 64
export const grassVer2MD: ObjectImageMD = {
  imageMDInfos: [
    {
      src: './assets/spaceMain/object/grassVer2.png',
      centerPosPixelOffset: {x: 0, y: 0},
    },
  ],
  collisionMDInfos: [],
};

// 160 * 120
export const rockMD: ObjectImageMD = {
  imageMDInfos: [
    {
      src: './assets/spaceMain/object/rock.png',
      centerPosPixelOffset: {x: 0, y: 0},
    },
  ],
  collisionMDInfos: [
    {
      collisionType: ObjectCollisionFigureEnum.FILLED_SQUARE,
      centerPosPixelOffset: {x: 0, y: 60 - 22},
      size: {width: 180, height: 10},
    },
  ],
};

//////////////////////////////// AvatarSizeInfo /////////////////////////////////

///////////////////////////////////////////////////////////////////////////////
// 말하는 토끼
export const whiteRabbitMD: AvatarImageMD = {
  avatarType: AvatarImageEnum.WHITE_RABBIT,
  avatarInitialName: '흰 토끼',
  avatarMDInfos: [
    {
      src: './assets/spaceMain/vowel_avatar/armAndLeg.png',
      centerPosPixelOffset: {
        x: 11.5,
        y: 14,
      },
      partType: AvatarPartImageEnum.RIGHT_ARM,
    },
    {
      src: './assets/spaceMain/vowel_avatar/armAndLeg.png',
      centerPosPixelOffset: {
        x: 9,
        y: 47,
      },
      partType: AvatarPartImageEnum.RIGHT_LEG,
    },
    {
      src: './assets/spaceMain/vowel_avatar/body.png',
      centerPosPixelOffset: {
        x: 0,
        y: 17,
      },
      partType: AvatarPartImageEnum.BODY,
    },
    {
      src: './assets/spaceMain/vowel_avatar/armAndLeg.png',
      centerPosPixelOffset: {
        x: -11.5,
        y: 14,
      },
      partType: AvatarPartImageEnum.LEFT_ARM,
    },
    {
      src: './assets/spaceMain/vowel_avatar/armAndLeg.png',
      centerPosPixelOffset: {
        x: -9,
        y: 47,
      },
      partType: AvatarPartImageEnum.LEFT_LEG,
    },
    {
      src: './assets/spaceMain/vowel_avatar/mute.png',
      centerPosPixelOffset: {
        x: 0,
        y: -53,
      },
      partType: AvatarPartImageEnum.FACE_MUTE,
    },
    {
      src: './assets/spaceMain/vowel_avatar/A.png',
      centerPosPixelOffset: {
        x: 0,
        y: -53,
      },
      partType: AvatarPartImageEnum.FACE_A,
    },
    {
      src: './assets/spaceMain/vowel_avatar/E.png',
      centerPosPixelOffset: {
        x: 0,
        y: -53,
      },
      partType: AvatarPartImageEnum.FACE_E,
    },
    {
      src: './assets/spaceMain/vowel_avatar/I.png',
      centerPosPixelOffset: {
        x: 0,
        y: -53,
      },
      partType: AvatarPartImageEnum.FACE_I,
    },
    {
      src: './assets/spaceMain/vowel_avatar/O.png',
      centerPosPixelOffset: {
        x: 0,
        y: -53,
      },
      partType: AvatarPartImageEnum.FACE_O,
    },
    {
      src: './assets/spaceMain/vowel_avatar/U.png',
      centerPosPixelOffset: {
        x: 0,
        y: -53,
      },
      partType: AvatarPartImageEnum.FACE_U,
    },
  ],
};

export const avatarImageMDs = [whiteRabbitMD];

export interface Formant {
  label: string;
  array: number[];
  Image: HTMLImageElement | null;
}
