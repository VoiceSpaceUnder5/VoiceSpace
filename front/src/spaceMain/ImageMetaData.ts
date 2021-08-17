import {Vec2} from './RTCGameUtils';
// 파일이름은 imageInfo 지만 이 안에서 backgroundMetaData
// image src 의 주소를 따로 관리 하는 방법도 생각해 볼것.
// 여러 부분에서 참조 할 경우 위와 같이 한곳에서 관리 해야한다.

///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////// Enum And Interface Part Start ///////////////////////////
const replaceWorld = '{replaceSpace}';

export enum ObjectCollisionFigureEnum {
  NOT_FILLED_SQUARE,
  NOT_FILLED_ELLIPSE,
  FILLED_SQUARE,
  FILLED_ELLIPSE,
}

export enum CollisionArrayFillValueEnum {
  NONE = 0,
  OBSTACLE = 1,
}

export enum AnimalImageEnum {
  BROWN_HORSE = 0,
  BROWN_BEAR = 1,
  PINK_PIG = 2,
  WHITE_RABBIT = 3,
}

export enum AnimalPartImageEnum {
  BODY = 0,
  FACE_MUTE = 1,
  FACE_SPEAK = 2,
  FACE_SPEAK_MOUSE = 3,
  FACE_SPEAK_SMILE = 4,
}

// 낮은 layer 부터 먼저 그려진다.
// BACKGROUND_XX -> OBSTACLE_BEFORE_ANIMAL_XX -> ANIMAL_XX -> OBSTACLE_AFTER_ANIMAL_XX 순으로 진행.
export enum LayerLevelEnum {
  BACKGROUND_ZERO = 0,
  BACKGROUND_ONE = 1,
  OBSTACLE_BEFORE_ANIMAL_ZERO = 2,
  OBSTACLE_BEFORE_ANIMAL_ONE = 3,
  ANIMAL_ZERO = 4,
  ANIMAL_ONE = 5,
  ANIMAL_TWO = 6,
  ANIMAL_THREE = 7,
  OBSTACLE_AFTER_ANIMAL_ZERO = 8,
  OBSTACLE_AFTER_ANIMAL_ONE = 9,
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
  backgroundSize?: Size;
}

export interface AnimalMDInfo extends ImageMDInfo {
  partType: AnimalPartImageEnum;
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
  arrayFillValue: CollisionArrayFillValueEnum;
  size: Size;
}

export interface ObjectImageMD {
  imageMDInfos: ImageMDInfo[];
  collisionMDInfos: CollisionMDInfo[];
}

export interface AnimalImageMD {
  animalMDInfos: AnimalMDInfo[];
  animalType: AnimalImageEnum;
}

///////////////////////////// Enum And Interface Part End /////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////
/////////////////////////// ImageMetaData Part Start ////////////////////////////
const seeAndMountainVer1MD: ObjectImageMD = {
  imageMDInfos: [
    {
      src: './assets/spaceMain/background/SeeAndMountainVer1.png',
      centerPosPixelOffset: {x: 0, y: 0},
      layerLev: LayerLevelEnum.BACKGROUND_ZERO,
      backgroundSize: {width: 2400, height: 2400},
    },
  ],
  collisionMDInfos: [
    {
      collisionType: ObjectCollisionFigureEnum.NOT_FILLED_SQUARE,
      arrayFillValue: CollisionArrayFillValueEnum.OBSTACLE,
      size: {width: 2400, height: 2400},
      centerPosPixelOffset: {x: 0, y: 0},
    },
  ],
};

const seeAndMountainVer2MD: ObjectImageMD = {
  imageMDInfos: [
    {
      src: './assets/spaceMain/background/SeeAndMountainVer2.png',
      centerPosPixelOffset: {x: 0, y: 0},
      layerLev: LayerLevelEnum.BACKGROUND_ZERO,
    },
  ],
  collisionMDInfos: [
    {
      collisionType: ObjectCollisionFigureEnum.NOT_FILLED_SQUARE,
      arrayFillValue: CollisionArrayFillValueEnum.OBSTACLE,
      size: {width: 2400, height: 2400},
      centerPosPixelOffset: {x: 0, y: 0},
    },
  ],
};

// bigTree unionSize = 352 x 440 (x4 ratio)
const bigTreeMD: ObjectImageMD = {
  imageMDInfos: [
    {
      src: './assets/spaceMain/object/bigTreeTop.png',
      centerPosPixelOffset: {x: 0, y: -(440 / 2 - 324 / 2)},
      layerLev: LayerLevelEnum.OBSTACLE_AFTER_ANIMAL_ZERO, // 동물 친구들 이후로 그려지는 것들중 가장 먼저 그려짐.
    },
    {
      src: './assets/spaceMain/object/bigTreeBottom.png',
      centerPosPixelOffset: {x: 0, y: +(440 / 2 - 240 / 2)},
      layerLev: LayerLevelEnum.OBSTACLE_BEFORE_ANIMAL_ONE,
    },
  ],
  collisionMDInfos: [
    {
      collisionType: ObjectCollisionFigureEnum.FILLED_SQUARE,
      arrayFillValue: CollisionArrayFillValueEnum.OBSTACLE,
      centerPosPixelOffset: {x: 0, y: 100},
      size: {width: 160, height: 128},
    },
  ],
};

// smallTree unionSize = 264 * 300 (x3 ratio)
// top :146 * 210
// bottom:264 * 180
const smallTreeMD: ObjectImageMD = {
  imageMDInfos: [
    {
      src: './assets/spaceMain/object/smallTreeTop.png',
      centerPosPixelOffset: {x: 0, y: -(300 / 2 - 210 / 2)},
      layerLev: LayerLevelEnum.OBSTACLE_AFTER_ANIMAL_ZERO, // 동물 친구들 이후로 그려지는 것들중 가장 먼저 그려짐.
    },
    {
      src: './assets/spaceMain/object/smallTreeBottom.png',
      centerPosPixelOffset: {x: 0, y: +(300 / 2 - 180 / 2)},
      layerLev: LayerLevelEnum.OBSTACLE_BEFORE_ANIMAL_ONE,
    },
  ],
  collisionMDInfos: [
    {
      collisionType: ObjectCollisionFigureEnum.FILLED_SQUARE,
      arrayFillValue: CollisionArrayFillValueEnum.OBSTACLE,
      centerPosPixelOffset: {x: 0, y: 60},
      size: {width: 120, height: 84},
    },
  ],
};

const greenGrassMD: ObjectImageMD = {
  imageMDInfos: [
    {
      src: './assets/spaceMain/object/greenGrass.png',
      centerPosPixelOffset: {x: 0, y: 0},
      layerLev: LayerLevelEnum.OBSTACLE_BEFORE_ANIMAL_ZERO,
    },
  ],
  collisionMDInfos: [],
};

const grayBlockMD: ObjectImageMD = {
  imageMDInfos: [
    {
      src: './assets/spaceMain/object/grayBlock.png',
      centerPosPixelOffset: {x: 0, y: 0},
      layerLev: LayerLevelEnum.OBSTACLE_AFTER_ANIMAL_ZERO,
    },
  ],
  collisionMDInfos: [
    {
      collisionType: ObjectCollisionFigureEnum.FILLED_SQUARE,
      arrayFillValue: CollisionArrayFillValueEnum.OBSTACLE,
      centerPosPixelOffset: {x: 0, y: 0},
      size: {width: 72, height: 72},
    },
  ],
};

//////////////////////////////// AnimalSizeInfo /////////////////////////////////
const brownBearMD: AnimalImageMD = {
  animalType: AnimalImageEnum.BROWN_BEAR,
  animalMDInfos: [
    {
      src: './assets/spaceMain/animal/brownBearBody.png',
      centerPosPixelOffset: {
        x: 0,
        y: -33,
      },
      layerLev: LayerLevelEnum.ANIMAL_ZERO,
      partType: AnimalPartImageEnum.BODY,
    },
    {
      src: './assets/spaceMain/animal/brownBearFaceMute.png',
      centerPosPixelOffset: {
        x: 0,
        y: 25,
      },
      layerLev: LayerLevelEnum.ANIMAL_ONE,
      partType: AnimalPartImageEnum.FACE_MUTE,
    },
    {
      src: './assets/spaceMain/animal/brownBearFaceSpeak.png',
      centerPosPixelOffset: {
        x: 0,
        y: 25,
      },
      layerLev: LayerLevelEnum.ANIMAL_ONE,
      partType: AnimalPartImageEnum.FACE_SPEAK,
    },
    {
      src: './assets/spaceMain/animal/brownBearFaceSpeakMouse.png',
      centerPosPixelOffset: {
        x: 0,
        y: 25,
      },
      layerLev: LayerLevelEnum.ANIMAL_ONE,
      partType: AnimalPartImageEnum.FACE_SPEAK_MOUSE,
    },
    {
      src: './assets/spaceMain/animal/brownBearFaceSpeakSmile.png',
      centerPosPixelOffset: {
        x: 0,
        y: 25,
      },
      layerLev: LayerLevelEnum.ANIMAL_ONE,
      partType: AnimalPartImageEnum.FACE_SPEAK_SMILE,
    },
  ],
};

const brownHorseMD: AnimalImageMD = {
  animalType: AnimalImageEnum.BROWN_HORSE,
  animalMDInfos: [
    {
      src: './assets/spaceMain/animal/brownHorseBody.png',
      centerPosPixelOffset: {
        x: 0,
        y: -40,
      },
      layerLev: LayerLevelEnum.ANIMAL_ZERO,
      partType: AnimalPartImageEnum.BODY,
    },
    {
      src: './assets/spaceMain/animal/brownHorseFaceMute.png',
      centerPosPixelOffset: {
        x: 0,
        y: 12,
      },
      layerLev: LayerLevelEnum.ANIMAL_ONE,
      partType: AnimalPartImageEnum.FACE_MUTE,
    },
    {
      src: './assets/spaceMain/animal/brownHorseFaceSpeak.png',
      centerPosPixelOffset: {
        x: 0,
        y: 12,
      },
      layerLev: LayerLevelEnum.ANIMAL_ONE,
      partType: AnimalPartImageEnum.FACE_SPEAK,
    },
    {
      src: './assets/spaceMain/animal/brownHorseFaceSpeakMouse.png',
      centerPosPixelOffset: {
        x: 0,
        y: 12,
      },
      layerLev: LayerLevelEnum.ANIMAL_ONE,
      partType: AnimalPartImageEnum.FACE_SPEAK_MOUSE,
    },
    {
      src: './assets/spaceMain/animal/brownHorseFaceSpeakSmile.png',
      centerPosPixelOffset: {
        x: 0,
        y: 12,
      },
      layerLev: LayerLevelEnum.ANIMAL_ONE,
      partType: AnimalPartImageEnum.FACE_SPEAK_SMILE,
    },
  ],
};

const whiteRabbitMD: AnimalImageMD = {
  animalType: AnimalImageEnum.WHITE_RABBIT,
  animalMDInfos: [
    {
      src: './assets/spaceMain/animal/whiteRabbitBody.png',
      centerPosPixelOffset: {
        x: 0,
        y: -36,
      },
      layerLev: LayerLevelEnum.ANIMAL_ZERO,
      partType: AnimalPartImageEnum.BODY,
    },
    {
      src: './assets/spaceMain/animal/whiteRabbitFaceMute.png',
      centerPosPixelOffset: {
        x: 0,
        y: 8,
      },
      layerLev: LayerLevelEnum.ANIMAL_ONE,
      partType: AnimalPartImageEnum.FACE_MUTE,
    },
    {
      src: './assets/spaceMain/animal/whiteRabbitFaceSpeak.png',
      centerPosPixelOffset: {
        x: 0,
        y: 8,
      },
      layerLev: LayerLevelEnum.ANIMAL_ONE,
      partType: AnimalPartImageEnum.FACE_SPEAK,
    },
    {
      src: './assets/spaceMain/animal/whiteRabbitFaceSpeakMouse.png',
      centerPosPixelOffset: {
        x: 0,
        y: 8,
      },
      layerLev: LayerLevelEnum.ANIMAL_ONE,
      partType: AnimalPartImageEnum.FACE_SPEAK_MOUSE,
    },
    {
      src: './assets/spaceMain/animal/whiteRabbitFaceSpeakSmile.png',
      centerPosPixelOffset: {
        x: 0,
        y: 8,
      },
      layerLev: LayerLevelEnum.ANIMAL_ONE,
      partType: AnimalPartImageEnum.FACE_SPEAK_SMILE,
    },
  ],
};

const pinkPigMD: AnimalImageMD = {
  animalType: AnimalImageEnum.PINK_PIG,
  animalMDInfos: [
    {
      src: './assets/spaceMain/animal/pinkPigBody.png',
      centerPosPixelOffset: {
        x: 0,
        y: -44,
      },
      layerLev: LayerLevelEnum.ANIMAL_ZERO,
      partType: AnimalPartImageEnum.BODY,
    },
    {
      src: './assets/spaceMain/animal/pinkPigFaceMute.png',
      centerPosPixelOffset: {
        x: 0,
        y: 28,
      },
      layerLev: LayerLevelEnum.ANIMAL_ONE,
      partType: AnimalPartImageEnum.FACE_MUTE,
    },
    {
      src: './assets/spaceMain/animal/pinkPigFaceSpeak.png',
      centerPosPixelOffset: {
        x: 0,
        y: 28,
      },
      layerLev: LayerLevelEnum.ANIMAL_ONE,
      partType: AnimalPartImageEnum.FACE_SPEAK,
    },
    {
      src: './assets/spaceMain/animal/pinkPigFaceSpeakMouse.png',
      centerPosPixelOffset: {
        x: 0,
        y: 28,
      },
      layerLev: LayerLevelEnum.ANIMAL_ONE,
      partType: AnimalPartImageEnum.FACE_SPEAK_MOUSE,
    },
    {
      src: './assets/spaceMain/animal/pinkPigFaceSpeakSmile.png',
      centerPosPixelOffset: {
        x: 0,
        y: 28,
      },
      layerLev: LayerLevelEnum.ANIMAL_ONE,
      partType: AnimalPartImageEnum.FACE_SPEAK_SMILE,
    },
  ],
};

//////////////////////////////// AnimalSizeInfo /////////////////////////////////

const setTexParam = (gl: WebGLRenderingContext, tex: WebGLTexture): void => {
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
};

const makeDummyTex = (gl: WebGLRenderingContext): WebGLTexture | null => {
  const tex = gl.createTexture();
  if (!tex) {
    console.error('makeDummyTex createTexture Error');
    return null;
  }
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    1, // width
    1, // height
    0, // border
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array([0, 0, 255, 255]), // 파란색
  );
  setTexParam(gl, tex);
  return tex;
};

const updateImageInfoWithSrc = (
  src: string,
  imageInfo: ImageInfo,
  gl: WebGLRenderingContext,
): void => {
  const tex = gl.createTexture();
  if (!tex) {
    console.error('updateImageInfoWithSrc createTexture Error');
    return;
  }
  setTexParam(gl, tex);

  const image = new Image();
  image.addEventListener('load', () => {
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    imageInfo.tex = tex;
    imageInfo.size.width = image.width;
    imageInfo.size.height = image.height;
  });
  image.src = src;

  return;
};

const makeImageInfoFromImageMD = (
  target: ImageMDInfo,
  centerPos: Vec2,
  gl: WebGLRenderingContext,
  objectsArray?: ImageInfo[][],
): ImageInfo | undefined => {
  const tex = makeDummyTex(gl);
  if (!tex) {
    return;
  }
  const imageInfo: ImageInfo = {
    tex: tex,
    centerPos: centerPos,
    size: {width: 1, height: 1},
    centerPosPixelOffset: target.centerPosPixelOffset,
  };
  if (objectsArray) objectsArray[target.layerLev].push(imageInfo);
  updateImageInfoWithSrc(target.src, imageInfo, gl);
  return imageInfo;
};

const makeCollisionArrayFromCollisionMD = (
  target: CollisionMDInfo,
  centerPos: Vec2,
  collisionArray: CollisionArrayFillValueEnum[][],
): void => {
  switch (target.collisionType) {
    case ObjectCollisionFigureEnum.FILLED_SQUARE: {
      const x_init =
        centerPos.x - target.size.width / 2 + target.centerPosPixelOffset.x;
      const x_limit =
        centerPos.x + target.size.width / 2 + target.centerPosPixelOffset.x;
      const y_init =
        centerPos.y - target.size.height / 2 + target.centerPosPixelOffset.y;
      const y_limit =
        centerPos.y + target.size.height / 2 + target.centerPosPixelOffset.y;
      for (let x = x_init; x < x_limit; x++) {
        for (let y = y_init; y < y_limit; y++) {
          collisionArray[x][y] = target.arrayFillValue;
        }
      }
      break;
    }
    default: {
      console.error(
        'makeCollisionArrayFromCollisionMD takes wrong param error',
      );
      break;
    }
  }
};

export const makeWorldMap1 = (
  objectsArray: ImageInfo[][],
  gl: WebGLRenderingContext,
): CollisionArrayFillValueEnum[][] | undefined => {
  if (
    !seeAndMountainVer1MD.collisionMDInfos[0] ||
    !seeAndMountainVer1MD.imageMDInfos[0] ||
    !seeAndMountainVer1MD.imageMDInfos[0].backgroundSize
  ) {
    console.error('seeAndMountainVer1MD is invalid');
    return;
  }
  const result = Array.from(
    Array(seeAndMountainVer1MD.imageMDInfos[0].backgroundSize.width),
    () =>
      Array(seeAndMountainVer1MD.imageMDInfos[0].backgroundSize!.height).fill(
        CollisionArrayFillValueEnum.NONE,
      ),
  );

  const backgroundCenterPos: Vec2 = {
    x: seeAndMountainVer1MD.imageMDInfos[0].backgroundSize!.width / 2,
    y: seeAndMountainVer1MD.imageMDInfos[0].backgroundSize!.height / 2,
  };
  makeImageInfoFromImageMD(
    seeAndMountainVer1MD.imageMDInfos[0],
    backgroundCenterPos,
    gl,
    objectsArray,
  );
  makeCollisionArrayFromCollisionMD(
    seeAndMountainVer1MD.collisionMDInfos[0],
    backgroundCenterPos,
    result,
  );

  return result;
};

export const makeAnimalMap = (
  animalsMap: Map<AnimalImageEnum, Map<AnimalPartImageEnum, ImageInfo>>,
  gl: WebGLRenderingContext,
): void => {
  const loadAnimalArray: AnimalImageMD[] = [
    brownBearMD,
    brownHorseMD,
    whiteRabbitMD,
    pinkPigMD,
  ];

  loadAnimalArray.forEach(target => {
    const map = new Map<AnimalPartImageEnum, ImageInfo>();
    target.animalMDInfos.forEach(info => {
      const imageInfo = makeImageInfoFromImageMD(info, {x: 0, y: 0}, gl);
      if (!imageInfo) {
        console.error('makeAnimalMap loop error imageInfo is not valid');
        return;
      }
      map.set(info.partType, imageInfo);
    });
    animalsMap.set(target.animalType, map);
  });

  return;
};

/////////////////////////// ImageMetaData Part End ./////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
