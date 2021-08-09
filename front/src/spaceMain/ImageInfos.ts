enum ImageInfoEnum {
  FACE,
  BODY,
  OBSTACLE,
}

interface ImageInfo {
  src: string;
  tex: WebGLTexture;
  width: number;
  height: number;
  centerPositionPixelOffsetX: number;
  centerPositionPixelOffsetY: number;
  type: ImageInfoEnum;
  unionPixelWidth: number;
  unionPixelHeight: number;
}

interface ObjectInfo {
  name: string;
  idx: number;
  imageInfos: ImageInfo[];
}

const backgroundMetaData = [
  {
    src: "./assets/spaceMain/background/SeeAndMountainVer2.png",
  },
];

const animalMetaData = [
  {
    name: "brownHorse",
    idx: 0,
    imageInfos: [
      {
        src: "./assets/spaceMain/animal/brownHorseFaceMute.png",
        type: ImageInfoEnum.FACE,
        unionPixelWidth: 120,
        unionPixelHeight: 200,
      },
      {
        src: "./assets/spaceMain/animal/brownHorseBody.png",
        type: ImageInfoEnum.BODY,
        unionPixelWidth: 120,
        unionPixelHeight: 200,
      },
    ],
  },
  {
    name: "whiteRabbit",
    idx: 1,
    imageInfos: [
      {
        src: "./assets/spaceMain/animal/whiteRabbitFaceMute.png",
        type: ImageInfoEnum.FACE,
        unionPixelWidth: 144,
        unionPixelHeight: 200,
      },
      {
        src: "./assets/spaceMain/animal/whiteRabbitBody.png",
        type: ImageInfoEnum.BODY,
        unionPixelWidth: 144,
        unionPixelHeight: 200,
      },
    ],
  },
];

class ImageInfoProvider {
  background: ImageInfo;
  animals: ObjectInfo[];
  gl: WebGLRenderingContext;

  constructor(gl: WebGLRenderingContext, backgroundIdx: number) {
    this.gl = gl;
    this.background = this.makeImageInfoFromUrl(
      backgroundMetaData[backgroundIdx].src,
      ImageInfoEnum.OBSTACLE,
      1,
      1
    )!;
    this.animals = [];
    animalMetaData.forEach((objInfo) => {
      const newAnimal: ObjectInfo = {
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
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      1,
      1,
      0,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 255, 255])
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
      if (imageInfo.type === ImageInfoEnum.FACE) {
        imageInfo.centerPositionPixelOffsetX = 0;
        imageInfo.centerPositionPixelOffsetY =
          imageInfo.unionPixelHeight - imageInfo.height;
      } else if (imageInfo.type === ImageInfoEnum.BODY) {
        imageInfo.centerPositionPixelOffsetX =
          imageInfo.unionPixelWidth / 2 - imageInfo.width / 2;
        imageInfo.centerPositionPixelOffsetY = 0;
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
