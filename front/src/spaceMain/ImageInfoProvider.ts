import {Vec2} from './RTCGameUtils';
import IdProvider from './IdProvider';
import {
  ImageInfo,
  AvatarImageEnum,
  LayerLevelEnum,
  AvatarPartImageEnum,
  PixelData,
  ImageMDInfo,
  CollisionMDInfo,
  ObjectCollisionFigureEnum,
  ObjectImageMD,
  seaAndMountainVer1MD,
  AvatarImageMD,
  brownBearMD,
  brownHorseMD,
  whiteRabbitMD,
  pinkPigMD,
  bigTreeMD,
  grayBlockMD,
  greenGrassMD,
  smallTreeMD,
} from './ImageMetaData';

class ImageInfoProvider {
  objects: Map<LayerLevelEnum, Map<number, ImageInfo>>; // objects[LayerLevelEnum][ImageInfoID]
  pixelInfos: PixelData[][]; //
  avatars: Map<AvatarImageEnum, Map<AvatarPartImageEnum, ImageInfo>>;
  gl: WebGLRenderingContext;

  constructor(gl: WebGLRenderingContext, backgroundIdx: number) {
    this.gl = gl;
    this.objects = new Map();
    this.avatars = new Map();
    this.pixelInfos = [];
    this.makeAvatarMap();
    // 위 코드까지는 반드시 필요합니다. //
    // 아래 코드는 코드적으로 맵을 생성해내는 것입니다. //
    this.makeWorldMap1();
  }
  getAvatarImageInfo(
    avatarEnum: AvatarImageEnum,
    avatarPartEnum: AvatarPartImageEnum,
  ) {
    const result = this.avatars.get(avatarEnum)?.get(avatarPartEnum);
    if (!result) {
      //console.error('cannot find imageInfo from avatarMap error');
    }
    return result;
  }

  setTexParam = (tex: WebGLTexture): void => {
    this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_S,
      this.gl.CLAMP_TO_EDGE,
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_T,
      this.gl.CLAMP_TO_EDGE,
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MIN_FILTER,
      this.gl.NEAREST,
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MAG_FILTER,
      this.gl.NEAREST,
    );
  };

  makeDummyTex = (): WebGLTexture | null => {
    const tex = this.gl.createTexture();
    if (!tex) {
      console.error('makeDummyTex createTexture Error');
      return null;
    }
    this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      1, // width
      1, // height
      0, // border
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 255, 255]), // 파란색
    );
    this.setTexParam(tex);
    return tex;
  };

  updateImageInfoWithSrc = (
    src: string,
    imageInfo: ImageInfo,
    id?: number,
  ): void => {
    const tex = this.gl.createTexture();
    if (!tex) {
      console.error('updateImageInfoWithSrc createTexture Error');
      return;
    }
    this.setTexParam(tex);

    const image = new Image();
    image.addEventListener('load', () => {
      this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
      this.gl.texImage2D(
        this.gl.TEXTURE_2D,
        0,
        this.gl.RGBA,
        this.gl.RGBA,
        this.gl.UNSIGNED_BYTE,
        image,
      );
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
            if (id)
              this.pixelInfos[x][y] = {
                ...this.pixelInfos[x][y],
                imageInfoKey: id,
              };
          }
        }
      }
    });
    image.src = src;
    return;
  };

  makeAvatarInfoFromImageMD = (target: ImageMDInfo): ImageInfo | undefined => {
    const tex = this.makeDummyTex();
    if (!tex) {
      return;
    }
    const imageInfo: ImageInfo = {
      tex: tex,
      centerPos: {x: 0, y: 0},
      size: {width: 1, height: 1},
      centerPosPixelOffset: target.centerPosPixelOffset,
    };
    this.updateImageInfoWithSrc(target.src, imageInfo);
    return imageInfo;
  };

  makeImageInfoFromImageMD = (
    target: ImageMDInfo,
    centerPos: Vec2,
    id: number,
  ): ImageInfo | undefined => {
    const tex = this.makeDummyTex();
    if (!tex) {
      return;
    }
    const imageInfo: ImageInfo = {
      tex: tex,
      centerPos: centerPos,
      size: {width: 1, height: 1},
      centerPosPixelOffset: target.centerPosPixelOffset,
    };
    if (!this.objects.has(target.layerLev))
      this.objects.set(target.layerLev, new Map<number, ImageInfo>());
    this.objects.get(target.layerLev)!.set(id, imageInfo);
    this.updateImageInfoWithSrc(target.src, imageInfo, id);
    return imageInfo;
  };

  makeCollisionArrayFromCollisionMD = (
    tg: CollisionMDInfo,
    centerPos: Vec2,
    id: number,
  ): void => {
    const xInit = centerPos.x - tg.size.width / 2 + tg.centerPosPixelOffset.x;
    const xLimit = centerPos.x + tg.size.width / 2 + tg.centerPosPixelOffset.x;
    const yInit = centerPos.y - tg.size.height / 2 + tg.centerPosPixelOffset.y;
    const yLimit = centerPos.y + tg.size.height / 2 + tg.centerPosPixelOffset.y;
    switch (tg.collisionType) {
      case ObjectCollisionFigureEnum.NOT_FILLED_SQUARE: {
        const xLoop = [xInit, xLimit - 1];
        const yLoop = [yInit, yLimit - 1];
        xLoop.forEach(x => {
          for (let y = yInit; y < yLimit; y++) {
            this.pixelInfos[x][y] = {
              ...this.pixelInfos[x][y],
              collisionInfoKey: id,
            };
          }
        });
        yLoop.forEach(y => {
          for (let x = xInit; x < xLimit; x++) {
            this.pixelInfos[x][y] = {
              ...this.pixelInfos[x][y],
              collisionInfoKey: id,
            };
          }
        });
        break;
      }

      case ObjectCollisionFigureEnum.FILLED_SQUARE: {
        for (let x = xInit; x < xLimit; x++) {
          for (let y = yInit; y < yLimit; y++) {
            this.pixelInfos[x][y] = {
              ...this.pixelInfos[x][y],
              collisionInfoKey: id,
            };
          }
        }
        break;
      }
      case ObjectCollisionFigureEnum.FILLED_ELLIPSE: {
        const a = tg.size.width / 2;
        const b = tg.size.height / 2;

        for (let x = xInit; x < xLimit; x++) {
          for (let y = yInit; y < yLimit; y++) {
            const xOrigin = x - centerPos.x - tg.centerPosPixelOffset.x;
            const yOrigin = y - centerPos.y - tg.centerPosPixelOffset.y;
            if (Math.pow(xOrigin / a, 2) + Math.pow(yOrigin / b, 2) <= 1) {
              this.pixelInfos[x][y] = {
                ...this.pixelInfos[x][y],
                collisionInfoKey: id,
              };
            }
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

  insertObjectFromObjectImageMD = (
    target: ObjectImageMD,
    centerPos: Vec2,
  ): void => {
    const id = IdProvider.getId();

    target.imageMDInfos.forEach(imageInfo => {
      this.makeImageInfoFromImageMD(imageInfo, centerPos, id);
    });
    target.collisionMDInfos.forEach(collisionInfo => {
      this.makeCollisionArrayFromCollisionMD(collisionInfo, centerPos, id);
    });
  };

  // 첫번째 월드맵을 만드는 함수입니다.
  makeWorldMap1 = (): void => {
    // param valid check
    if (
      !seaAndMountainVer1MD.collisionMDInfos[0] ||
      !seaAndMountainVer1MD.imageMDInfos[0] ||
      !seaAndMountainVer1MD.imageMDInfos[0].backgroundSize
    ) {
      console.error('seaAndMountainVer1MD is invalid');
      return;
    }
    // pixel 정보를 저장할 2차원배열을 백그라운드 이미지의 사이즈만큼 resize 해줍니다.
    this.pixelInfos = Array.from(
      Array(seaAndMountainVer1MD.imageMDInfos[0].backgroundSize.width),
      () =>
        Array(seaAndMountainVer1MD.imageMDInfos[0].backgroundSize!.height).fill(
          {
            imageInfoKey: 0,
            collisionInfoKey: 0,
          },
        ),
    );

    // backgroundImageCenterPosition
    const backgroundCenterPos: Vec2 = {
      x: seaAndMountainVer1MD.imageMDInfos[0].backgroundSize!.width / 2,
      y: seaAndMountainVer1MD.imageMDInfos[0].backgroundSize!.height / 2,
    };

    // insertObjectFromObjectImageMD 함수 이용하여 object 를 배치합니다.
    this.insertObjectFromObjectImageMD(
      seaAndMountainVer1MD,
      backgroundCenterPos,
    );
    this.insertObjectFromObjectImageMD(bigTreeMD, {x: 900, y: 900});
    this.insertObjectFromObjectImageMD(smallTreeMD, {x: 1600, y: 800});
    for (let i = 0; i < 15; i++) {
      this.insertObjectFromObjectImageMD(grayBlockMD, {
        x: 800 + i * grayBlockMD.collisionMDInfos[0].size.width,
        y: 500,
      });
    }
    for (let i = 0; i < 15; i++) {
      this.insertObjectFromObjectImageMD(grayBlockMD, {
        x: 800 + i * grayBlockMD.collisionMDInfos[0].size.width,
        y: 1450,
      });
    }
    for (let i = 0; i < 11; i++) {
      this.insertObjectFromObjectImageMD(grayBlockMD, {
        x: 800 + 14 * grayBlockMD.collisionMDInfos[0].size.width,
        y: 500 + i * grayBlockMD.collisionMDInfos[0].size.height,
      });
    }
    this.insertObjectFromObjectImageMD(greenGrassMD, {x: 900, y: 900});
    this.insertObjectFromObjectImageMD(greenGrassMD, {x: 1100, y: 1100});
    this.insertObjectFromObjectImageMD(greenGrassMD, {x: 1200, y: 1200});
    this.insertObjectFromObjectImageMD(greenGrassMD, {x: 1300, y: 1100});
    this.insertObjectFromObjectImageMD(greenGrassMD, {x: 1300, y: 1000});
    this.insertObjectFromObjectImageMD(greenGrassMD, {x: 1500, y: 1000});
  };

  makeAvatarMap = (): void => {
    const loadAvatarArray: AvatarImageMD[] = [
      brownBearMD,
      brownHorseMD,
      whiteRabbitMD,
      pinkPigMD,
    ];

    loadAvatarArray.forEach(target => {
      const map = new Map<AvatarPartImageEnum, ImageInfo>();
      target.avatarMDInfos.forEach(info => {
        const imageInfo = this.makeAvatarInfoFromImageMD(info);
        if (!imageInfo) {
          console.error('makeAvatarMap loop error imageInfo is not valid');
          return;
        }
        map.set(info.partType, imageInfo);
      });
      this.avatars.set(target.avatarType, map);
    });

    return;
  };
}

export default ImageInfoProvider;
