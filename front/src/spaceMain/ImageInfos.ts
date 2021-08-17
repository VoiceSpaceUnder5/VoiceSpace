import {
  animalMetaData,
  backgroundMetaData,
  ImageInfoEnum,
  ObjectCollisionFigureEnum,
  CollisionInfo,
} from "./ImageMetaData";

export interface ImageInfo {
  src: string;
  tex: WebGLTexture;
  width: number;
  height: number;
  centerPositionPixelOffsetX: number;
  centerPositionPixelOffsetY: number;
  originCenterPositionX: number;
  originCenterPositionY: number;
  type: ImageInfoEnum;
  unionPixelWidth: number;
  unionPixelHeight: number;
}

interface AnimalInfo {
  name: string;
  idx: number;
  imageInfos: ImageInfo[];
}

interface BackgroundInfo {
  name: string;
  idx: number;
  backgroundImageInfo: ImageInfo;
  objectInfos: ImageInfo[];
  objectArray: number[][]; // 2400 * 2400
}

class ImageInfoProvider {
  background: BackgroundInfo;
  animals: AnimalInfo[];
  gl: WebGLRenderingContext;

  constructor(gl: WebGLRenderingContext, backgroundIdx: number) {
    this.gl = gl;

    this.background = {
      name: backgroundMetaData[backgroundIdx].name,
      idx: backgroundMetaData[backgroundIdx].idx,
      backgroundImageInfo: this.makeImageInfoFromUrl(
        backgroundMetaData[backgroundIdx].src,
        ImageInfoEnum.BACKGROUND,
        backgroundMetaData[backgroundIdx].width,
        backgroundMetaData[backgroundIdx].height
      )!,
      objectInfos: [],
      objectArray: Array.from(
        Array(backgroundMetaData[backgroundIdx].width),
        () => Array(backgroundMetaData[backgroundIdx].height).fill(0)
      ),
    };

    backgroundMetaData[backgroundIdx].objectInfos.forEach((objectInfo) => {
      const newObjectInfo = this.makeImageInfoFromUrl(
        objectInfo.imageInfo.src,
        objectInfo.imageInfo.type,
        objectInfo.imageInfo.unionPixelWidth,
        objectInfo.imageInfo.unionPixelHeight
      )!;
      newObjectInfo.originCenterPositionX =
        objectInfo.imageInfo.centerPositionX;
      newObjectInfo.originCenterPositionY =
        objectInfo.imageInfo.centerPositionY;
      this.background.objectInfos.push(newObjectInfo);

      if (objectInfo.collisionInfo) {
        //collision detection map array setting
        const init_x =
          objectInfo.collisionInfo.centerPositionX -
          objectInfo.collisionInfo.width / 2; // initialize

        const condition_x =
          objectInfo.collisionInfo.centerPositionX +
          objectInfo.collisionInfo.width / 2; // condition

        const init_y =
          objectInfo.collisionInfo.centerPositionY -
          objectInfo.collisionInfo.height / 2; // initialize

        const condition_y =
          objectInfo.collisionInfo.centerPositionY +
          objectInfo.collisionInfo.height / 2; // condition

        for (let x = init_x; x < condition_x; x++) {
          for (let y = init_y; y < condition_y; y++) {
            this.collisionArraySetting(
              x,
              y,
              objectInfo.collisionInfo,
              this.background.objectArray
            );
          }
        }
      }
    });

    this.animals = [];
    animalMetaData.forEach((objInfo) => {
      const newAnimal: AnimalInfo = {
        name: objInfo.name,
        idx: objInfo.idx,
        imageInfos: [],
      };
      objInfo.imageInfos.forEach((imageInfo) => {
        const newImageinfo = this.makeImageInfoFromUrl(
          imageInfo.src,
          imageInfo.type,
          imageInfo.unionPixelWidth,
          imageInfo.unionPixelHeight
        )!;
        newAnimal.imageInfos.push(newImageinfo);
      });
      this.animals.push(newAnimal);
    });
  }

  collisionArraySetting = (
    x: number,
    y: number,
    collisionInfo: CollisionInfo,
    objectArray: number[][]
  ) => {
    switch (collisionInfo.collisionType) {
      case ObjectCollisionFigureEnum.SQUARE: {
        objectArray[x][y] = collisionInfo.arrayFillValue;
        break;
      }
      case ObjectCollisionFigureEnum.ELLIPSE: {
        const a = collisionInfo.width / 2;
        const b = collisionInfo.height / 2;
        const result =
          Math.pow((x - collisionInfo.centerPositionX) / a, 2) +
          Math.pow((y - collisionInfo.centerPositionY) / b, 2);

        if (result <= 1) {
          objectArray[x][y] = collisionInfo.arrayFillValue;
        }
        break;
      }
      default: {
        // 잘못 들어온 부분
        console.error("meta data setting error.");
        // assert 를 넣으면 현 코드라인에서 멈춰진다. (하나의 디버깅 기법)
        // unitTest 이전의 기본적인 코드검증 방법이 assert 를 얼마나 잘 넣느냐 이다.
        // null 이나 undefined defense 에서 많이 사용한다.
        // error 구문 이후 return 보다는 assert 로 디버깅을 할것.
        break;
      }
    }
  };

  makeImageInfoFromUrl = (
    url: string,
    type: ImageInfoEnum,
    unionPixelWidth: number,
    unionPixelHeight: number
  ) => {
    const tex = this.gl.createTexture();
    if (!tex) {
      console.error(`createTexture error: ${url}`);
      return;
    }
    this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
    // 인자값이 상수로 들어 가 있는 부분에 대해서는
    // 1.이런 인자값을 더이상 신경 쓸 필요가 없는지, 2. 다같이 알아야 할 필요가 있는지에 따라 다르게..
    // 1. -> 이대로
    // 2. -> 변경될 가능성이 있다면 0과 1같은 값들이 어떤 의미를 가지는지 enum 으로 표현. (or 주석)
    // 인자값이 어떤것을 변화시키는 것인지 유추하기 힘들기 때문에 이것을 풀어서 많이 설명해둔다.
    // 매직넘버 ? -> 우리가 코드상에서 어떤 특정 숫자를 넣어두는 것(웬만하면 넣지말자 - 이 넘버가 무엇을 뜻하는지 문자로 설명하자 (enum or define))
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      1,
      1,
      0,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 255, 255]) // 여기안에 있는 숫자도 무엇을 뜻하는지 정확하게 알 수 없음.
    );

    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_S,
      this.gl.CLAMP_TO_EDGE
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_T,
      this.gl.CLAMP_TO_EDGE
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MIN_FILTER,
      this.gl.NEAREST
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MAG_FILTER,
      this.gl.NEAREST
    );

    const result: ImageInfo = {
      src: url,
      tex: tex,
      width: 1,
      height: 1,
      centerPositionPixelOffsetX: 0,
      centerPositionPixelOffsetY: 0,
      originCenterPositionX: 0,
      originCenterPositionY: 0,
      type: type,
      unionPixelWidth: unionPixelWidth,
      unionPixelHeight: unionPixelHeight,
    };
    this.updateImageInfo(result);
    return result;
  };

  updateImageInfo = (imageInfo: ImageInfo) => {
    const tex = this.gl.createTexture();
    if (!tex) {
      console.error(`createTexture error: ${imageInfo.src}`);
      return;
    }

    const image = new Image();
    image.addEventListener("load", () => {
      imageInfo.width = image.width;
      imageInfo.height = image.height;
      if (
        imageInfo.type === ImageInfoEnum.BODY ||
        imageInfo.type === ImageInfoEnum.TOP
      ) {
        imageInfo.centerPositionPixelOffsetX = 0;
        imageInfo.centerPositionPixelOffsetY = -(
          imageInfo.unionPixelHeight / 2 -
          imageInfo.height / 2
        );
      } else {
        imageInfo.centerPositionPixelOffsetX = 0;
        imageInfo.centerPositionPixelOffsetY =
          imageInfo.unionPixelHeight / 2 - imageInfo.height / 2;
      }

      this.gl.bindTexture(this.gl.TEXTURE_2D, tex); // texture 의 데이터 변경

      this.gl.texParameteri(
        this.gl.TEXTURE_2D,
        this.gl.TEXTURE_WRAP_S,
        this.gl.CLAMP_TO_EDGE
      );
      this.gl.texParameteri(
        this.gl.TEXTURE_2D,
        this.gl.TEXTURE_WRAP_T,
        this.gl.CLAMP_TO_EDGE
      );
      this.gl.texParameteri(
        this.gl.TEXTURE_2D,
        this.gl.TEXTURE_MIN_FILTER,
        this.gl.NEAREST
      );
      this.gl.texParameteri(
        this.gl.TEXTURE_2D,
        this.gl.TEXTURE_MAG_FILTER,
        this.gl.NEAREST
      );

      this.gl.texImage2D(
        this.gl.TEXTURE_2D,
        0,
        this.gl.RGBA,
        this.gl.RGBA,
        this.gl.UNSIGNED_BYTE,
        image
      );
      imageInfo.tex = tex;
    });
    image.src = imageInfo.src;
  };
}

export default ImageInfoProvider;
