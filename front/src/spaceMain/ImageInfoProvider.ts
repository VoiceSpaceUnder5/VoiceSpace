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
import {LoadingInfo} from './spaceMain';

interface ReadyToLoadValue {
  centerPos: Vec2;
  id: number;
}

class ImageInfoProvider {
  background: ImageInfo | null;
  objects: Map<LayerLevelEnum, Map<number, ImageInfo>>; // objects[LayerLevelEnum][ImageInfoID]
  pixelInfos: PixelData[][]; //
  avatars: Map<AvatarImageEnum, Map<AvatarPartImageEnum, ImageInfo>>;
  // for loading
  readyToLoad: Map<ObjectImageMD, ReadyToLoadValue[]>;
  setloadStatus: React.Dispatch<React.SetStateAction<LoadingInfo>>;

  gl: WebGLRenderingContext;
  constructor(
    gl: WebGLRenderingContext,
    setloadStatus: React.Dispatch<React.SetStateAction<LoadingInfo>>,
  ) {
    this.gl = gl;
    this.objects = new Map();
    this.avatars = new Map();
    this.readyToLoad = new Map();
    this.setloadStatus = setloadStatus;
    this.background = null;

    this.pixelInfos = [];
    this.makeAvatarMap();
    this.makeWorldMap1();
    console.log(this);
    // 위 코드까지는 반드시 필요합니다. //
    // 아래 코드는 코드적으로 맵을 생성해내는 것입니다. //
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

  increaseNeedToLoad = (value = 1): void => {
    this.setloadStatus(before => {
      //console.log('increaseNeedToLoad', before);
      return {...before, needToLoad: before.needToLoad + value};
    });
  };

  increasefinishLoad = (): void => {
    this.setloadStatus(before => {
      //console.log('increasefinishLoad', before);
      return {...before, finishLoad: before.finishLoad + 1};
    });
  };

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
      this.increasefinishLoad();
    });
    image.src = src;
    return;
  };

  makeAvatarInfoFromImageMD = (target: ImageMDInfo): ImageInfo | undefined => {
    this.increaseNeedToLoad();

    const tex = this.gl.createTexture();
    if (!tex) {
      console.error('updateImageInfoWithSrc createTexture Error');
      return;
    }
    this.setTexParam(tex);

    const result: ImageInfo = {
      tex: tex,
      size: {width: 1, height: 1},
      centerPos: {x: 0, y: 0},
      centerPosPixelOffset: target.centerPosPixelOffset,
    };

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
      result.tex = tex;
      result.size.width = image.width;
      result.size.height = image.height;
      this.increasefinishLoad();
    });
    image.src = target.src;
    return result;
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

  loadingImageInfoFromImageMDInfo = (
    imageMDInfo: ImageMDInfo,
    centerPos: Vec2,
    cb: (imageInfo: ImageInfo) => void,
  ) => {
    const tex = this.gl.createTexture();
    if (!tex) {
      console.error('cannot make tex in StartLoading...');
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
      const imageInfo: ImageInfo = {
        tex: tex,
        size: {width: image.width, height: image.height},
        centerPos: centerPos,
        centerPosPixelOffset: imageMDInfo.centerPosPixelOffset,
      };
      cb(imageInfo);
    });
    image.src = imageMDInfo.src;
  };

  startLoading = (): void => {
    this.readyToLoad.forEach((readyToLoadValues, target) => {
      target.collisionMDInfos.forEach(collisionMDInfo => {
        readyToLoadValues.forEach(readyToLoadValue => {
          this.makeCollisionArrayFromCollisionMD(
            collisionMDInfo,
            readyToLoadValue.centerPos,
            readyToLoadValue.id,
          );
        });
      });

      target.imageMDInfos.forEach(imageMdInfo => {
        const cb = (baseImageInfo: ImageInfo) => {
          readyToLoadValues.forEach(readyToLoadValue => {
            const imageInfo: ImageInfo = {
              tex: baseImageInfo.tex,
              centerPos: readyToLoadValue.centerPos,
              centerPosPixelOffset: baseImageInfo.centerPosPixelOffset,
              size: baseImageInfo.size,
            };
            if (!this.objects.has(imageMdInfo.layerLev))
              this.objects.set(
                imageMdInfo.layerLev,
                new Map<number, ImageInfo>(),
              );
            this.objects
              .get(imageMdInfo.layerLev)!
              .set(readyToLoadValue.id, imageInfo);
            const x_init = imageInfo.centerPos.x - imageInfo.size.width / 2;
            const x_limit = imageInfo.centerPos.x + imageInfo.size.width / 2;
            const y_init = imageInfo.centerPos.y - imageInfo.size.height / 2;
            const y_limit = imageInfo.centerPos.y + imageInfo.size.height / 2;
            for (let x = x_init; x < x_limit; x++) {
              for (let y = y_init; y < y_limit; y++) {
                this.pixelInfos[x][y] = {
                  ...this.pixelInfos[x][y],
                  imageInfoKey: readyToLoadValue.id,
                };
              }
            }
            this.increasefinishLoad();
          });
        };

        this.loadingImageInfoFromImageMDInfo(imageMdInfo, {x: 0, y: 0}, cb);
      });
    });
  };

  loadingBackGround = (bg: ObjectImageMD): void => {
    this.increaseNeedToLoad();
    // param valid check
    if (
      !bg.collisionMDInfos[0] ||
      !bg.imageMDInfos[0] ||
      !bg.imageMDInfos[0].backgroundSize
    ) {
      console.error('background is invalid');
      return;
    }
    // pixel 정보를 저장할 2차원배열을 백그라운드 이미지의 사이즈만큼 resize 해줍니다.
    this.pixelInfos = Array.from(
      Array(bg.imageMDInfos[0].backgroundSize.width),
      () =>
        Array(bg.imageMDInfos[0].backgroundSize!.height).fill({
          imageInfoKey: 0,
          collisionInfoKey: 0,
        }),
    );

    // backgroundImageCenterPosition
    const backgroundCenterPos: Vec2 = {
      x: seaAndMountainVer1MD.imageMDInfos[0].backgroundSize!.width / 2,
      y: seaAndMountainVer1MD.imageMDInfos[0].backgroundSize!.height / 2,
    };

    const cb = (imageInfo: ImageInfo) => {
      this.background = imageInfo;
      this.increasefinishLoad();
    };

    this.loadingImageInfoFromImageMDInfo(
      bg.imageMDInfos[0],
      backgroundCenterPos,
      cb,
    );
  };

  insertLoadingQueue = (target: ObjectImageMD, centerPos: Vec2): void => {
    const id = IdProvider.getId();
    if (!this.readyToLoad.has(target)) {
      this.readyToLoad.set(target, [{centerPos: centerPos, id: id}]);
    } else {
      this.readyToLoad.get(target)?.push({centerPos: centerPos, id: id});
    }
    this.increaseNeedToLoad(target.imageMDInfos.length);
  };

  // 첫번째 월드맵을 만드는 함수입니다.
  makeWorldMap1 = (): void => {
    this.loadingBackGround(seaAndMountainVer1MD);
    // insertloadQueue 를 통해서 로드되어야 할 것들을 로드큐에 넣어줍니다.
    this.insertLoadingQueue(bigTreeMD, {x: 900, y: 900});
    this.insertLoadingQueue(smallTreeMD, {x: 1600, y: 800});
    for (let i = 0; i < 15; i++) {
      this.insertLoadingQueue(grayBlockMD, {
        x: 800 + i * grayBlockMD.collisionMDInfos[0].size.width,
        y: 500,
      });
    }
    for (let i = 0; i < 15; i++) {
      this.insertLoadingQueue(grayBlockMD, {
        x: 800 + i * grayBlockMD.collisionMDInfos[0].size.width,
        y: 1450,
      });
    }
    for (let i = 0; i < 11; i++) {
      this.insertLoadingQueue(grayBlockMD, {
        x: 800 + 14 * grayBlockMD.collisionMDInfos[0].size.width,
        y: 500 + i * grayBlockMD.collisionMDInfos[0].size.height,
      });
    }
    this.insertLoadingQueue(greenGrassMD, {x: 900, y: 900});
    this.insertLoadingQueue(greenGrassMD, {x: 1100, y: 1100});
    this.insertLoadingQueue(greenGrassMD, {x: 1200, y: 1200});
    this.insertLoadingQueue(greenGrassMD, {x: 1300, y: 1100});
    this.insertLoadingQueue(greenGrassMD, {x: 1300, y: 1000});
    this.insertLoadingQueue(greenGrassMD, {x: 1500, y: 1000});
    this.startLoading();
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
