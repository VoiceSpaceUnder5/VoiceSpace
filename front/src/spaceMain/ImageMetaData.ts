import {Vec2} from './RTCGameUtils';
import IdProvider from './IdProvider';
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

export enum AvatarImageEnum {
  BROWN_HORSE = 0,
  BROWN_BEAR = 1,
  PINK_PIG = 2,
  WHITE_RABBIT = 3,
}

export enum AvatarPartImageEnum {
  BODY = 0,
  FACE_MUTE = 1,
  FACE_SPEAK = 2,
  FACE_SPEAK_MOUSE = 3,
  FACE_SPEAK_SMILE = 4,
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
  backgroundSize?: Size;
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

export interface AvatarImageMD {
  avatarMDInfos: AvatarMDInfo[];
  avatarType: AvatarImageEnum;
}

///////////////////////////// Enum And Interface Part End /////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////
/////////////////////////// ImageMetaData Part Start ////////////////////////////
const seaAndMountainVer1MD: ObjectImageMD = {
  imageMDInfos: [
    {
      src: './assets/spaceMain/background/seaAndMountainVer1.png',
      centerPosPixelOffset: {x: 0, y: 0},
      layerLev: LayerLevelEnum.BACKGROUND_ZERO,
      backgroundSize: {width: 2400, height: 2400},
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

const seaAndMountainVer2MD: ObjectImageMD = {
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
const bigTreeMD: ObjectImageMD = {
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
      collisionType: ObjectCollisionFigureEnum.FILLED_SQUARE,
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
      collisionType: ObjectCollisionFigureEnum.FILLED_SQUARE,
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
      layerLev: LayerLevelEnum.OBSTACLE_BEFORE_AVATAR_ZERO,
    },
  ],
  collisionMDInfos: [],
};

const grayBlockMD: ObjectImageMD = {
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
const brownBearMD: AvatarImageMD = {
  avatarType: AvatarImageEnum.BROWN_BEAR,
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
      src: './assets/spaceMain/avatar/brownBearFaceSpeakMouse.png',
      centerPosPixelOffset: {
        x: 0,
        y: 25,
      },
      layerLev: LayerLevelEnum.AVATAR_ONE,
      partType: AvatarPartImageEnum.FACE_SPEAK_MOUSE,
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
  ],
};

const brownHorseMD: AvatarImageMD = {
  avatarType: AvatarImageEnum.BROWN_HORSE,
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
      src: './assets/spaceMain/avatar/brownHorseFaceSpeakMouse.png',
      centerPosPixelOffset: {
        x: 0,
        y: 12,
      },
      layerLev: LayerLevelEnum.AVATAR_ONE,
      partType: AvatarPartImageEnum.FACE_SPEAK_MOUSE,
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

const whiteRabbitMD: AvatarImageMD = {
  avatarType: AvatarImageEnum.WHITE_RABBIT,
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
      src: './assets/spaceMain/avatar/whiteRabbitFaceSpeakMouse.png',
      centerPosPixelOffset: {
        x: 0,
        y: 8,
      },
      layerLev: LayerLevelEnum.AVATAR_ONE,
      partType: AvatarPartImageEnum.FACE_SPEAK_MOUSE,
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

const pinkPigMD: AvatarImageMD = {
  avatarType: AvatarImageEnum.PINK_PIG,
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
      src: './assets/spaceMain/avatar/pinkPigFaceSpeakMouse.png',
      centerPosPixelOffset: {
        x: 0,
        y: 28,
      },
      layerLev: LayerLevelEnum.AVATAR_ONE,
      partType: AvatarPartImageEnum.FACE_SPEAK_MOUSE,
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

//////////////////////////////// AvatarSizeInfo /////////////////////////////////

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
  id?: number,
  pixelInfos?: PixelData[][],
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
    if (id) {
      const x_init = imageInfo.centerPos.x - image.width / 2;
      const x_limit = imageInfo.centerPos.x + image.width / 2;
      const y_init = imageInfo.centerPos.y - image.height / 2;
      const y_limit = imageInfo.centerPos.y + image.height / 2;
      for (let x = x_init; x < x_limit; x++) {
        for (let y = y_init; y < y_limit; y++) {
          if (pixelInfos)
            pixelInfos[x][y] = {...pixelInfos[x][y], imageInfoKey: id};
        }
      }
    }
  });
  image.src = src;
  return;
};

const makeAvatarInfoFromImageMD = (
  target: ImageMDInfo,
  gl: WebGLRenderingContext,
) => {
  const tex = makeDummyTex(gl);
  if (!tex) {
    return;
  }
  const imageInfo: ImageInfo = {
    tex: tex,
    centerPos: {x: 0, y: 0},
    size: {width: 1, height: 1},
    centerPosPixelOffset: target.centerPosPixelOffset,
  };
  updateImageInfoWithSrc(target.src, imageInfo, gl);
  return imageInfo;
};

const makeImageInfoFromImageMD = (
  target: ImageMDInfo,
  centerPos: Vec2,
  gl: WebGLRenderingContext,
  pixelInfos: PixelData[][],
  objects: Map<LayerLevelEnum, Map<number, ImageInfo>>,
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
  const id = IdProvider.getId();
  if (!objects.has(target.layerLev))
    objects.set(target.layerLev, new Map<number, ImageInfo>());
  objects.get(target.layerLev)!.set(id, imageInfo);
  updateImageInfoWithSrc(target.src, imageInfo, gl, id, pixelInfos);
  return imageInfo;
};

const makeCollisionArrayFromCollisionMD = (
  target: CollisionMDInfo,
  centerPos: Vec2,
  pixelInfos: PixelData[][],
): void => {
  const id = IdProvider.getId();
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
          pixelInfos[x][y] = {...pixelInfos[x][y], collisionInfoKey: id};
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

const insertObjectFromObjectImageMD = (
  target: ObjectImageMD,
  gl: WebGLRenderingContext,
  centerPos: Vec2,
  objects: Map<LayerLevelEnum, Map<number, ImageInfo>>,
  pixelInfos: PixelData[][],
) => {
  target.imageMDInfos.forEach(imageInfo => {
    makeImageInfoFromImageMD(imageInfo, centerPos, gl, pixelInfos, objects);
  });
  target.collisionMDInfos.forEach(collisionInfo => {
    makeCollisionArrayFromCollisionMD(collisionInfo, centerPos, pixelInfos);
  });
};

export const makeWorldMap1 = (
  objects: Map<LayerLevelEnum, Map<number, ImageInfo>>,
  gl: WebGLRenderingContext,
): PixelData[][] | undefined => {
  if (
    !seaAndMountainVer1MD.collisionMDInfos[0] ||
    !seaAndMountainVer1MD.imageMDInfos[0] ||
    !seaAndMountainVer1MD.imageMDInfos[0].backgroundSize
  ) {
    console.error('seaAndMountainVer1MD is invalid');
    return;
  }
  const result = Array.from(
    Array(seaAndMountainVer1MD.imageMDInfos[0].backgroundSize.width),
    () =>
      Array(seaAndMountainVer1MD.imageMDInfos[0].backgroundSize!.height).fill({
        imageInfoKey: 0,
        collisionInfoKey: 0,
      }),
  );

  const backgroundCenterPos: Vec2 = {
    x: seaAndMountainVer1MD.imageMDInfos[0].backgroundSize!.width / 2,
    y: seaAndMountainVer1MD.imageMDInfos[0].backgroundSize!.height / 2,
  };
  makeImageInfoFromImageMD(
    seaAndMountainVer1MD.imageMDInfos[0],
    backgroundCenterPos,
    gl,
    result,
    objects,
  );
  makeCollisionArrayFromCollisionMD(
    seaAndMountainVer1MD.collisionMDInfos[0],
    backgroundCenterPos,
    result,
  );

  insertObjectFromObjectImageMD(
    bigTreeMD,
    gl,
    {x: 900, y: 900},
    objects,
    result,
  );

  insertObjectFromObjectImageMD(
    smallTreeMD,
    gl,
    {x: 1300, y: 900},
    objects,
    result,
  );

  insertObjectFromObjectImageMD(
    greenGrassMD,
    gl,
    {x: 1400, y: 1400},
    objects,
    result,
  );

  insertObjectFromObjectImageMD(
    grayBlockMD,
    gl,
    {x: 1000, y: 1000},
    objects,
    result,
  );

  return result;
};

export const makeAvatarMap = (
  avatarsMap: Map<AvatarImageEnum, Map<AvatarPartImageEnum, ImageInfo>>,
  gl: WebGLRenderingContext,
): void => {
  const loadAvatarArray: AvatarImageMD[] = [
    brownBearMD,
    brownHorseMD,
    whiteRabbitMD,
    pinkPigMD,
  ];

  loadAvatarArray.forEach(target => {
    const map = new Map<AvatarPartImageEnum, ImageInfo>();
    target.avatarMDInfos.forEach(info => {
      const imageInfo = makeAvatarInfoFromImageMD(info, gl);
      if (!imageInfo) {
        console.error('makeAvatarMap loop error imageInfo is not valid');
        return;
      }
      map.set(info.partType, imageInfo);
    });
    avatarsMap.set(target.avatarType, map);
  });

  return;
};

/////////////////////////// ImageMetaData Part End ./////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
