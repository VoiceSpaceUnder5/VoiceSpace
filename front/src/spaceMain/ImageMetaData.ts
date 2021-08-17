// 파일이름은 imageInfo 지만 이 안에서 backgroundMetaData
// image src 의 주소를 따로 관리 하는 방법도 생각해 볼것.
// 여러 부분에서 참조 할 경우 위와 같이 한곳에서 관리 해야한다.
export enum ImageInfoEnum {
  FACE_MUTE,
  FACE_SPEAK,
  FACE_SPEAK_MOUSE,
  TOP,
  BODY,
  OBJECT,
  BACKGROUND,
}

export enum ObjectCollisionFigureEnum {
  SQUARE,
  ELLIPSE,
}

export interface CollisionInfo {
  collisionType: ObjectCollisionFigureEnum;
  arrayFillValue: number;
  centerPositionX: number;
  centerPositionY: number;
  width: number;
  height: number;
}

export const backgroundMetaData = [
  {
    name: "SeeAndMountainVer1",
    idx: 0,
    src: "./assets/spaceMain/background/SeeAndMountainVer1.png",
    width: 2400,
    height: 2400,
    objectInfos: [
      {
        imageInfo: {
          src: "./assets/spaceMain/object/greenGrass.png",
          type: ImageInfoEnum.OBJECT,
          unionPixelWidth: 64,
          unionPixelHeight: 64,
          centerPositionX: 1000,
          centerPositionY: 1000,
        },
      },
      {
        imageInfo: {
          src: "./assets/spaceMain/object/greenGrass.png",
          type: ImageInfoEnum.OBJECT,
          unionPixelWidth: 64,
          unionPixelHeight: 64,
          centerPositionX: 950,
          centerPositionY: 1050,
        },
        collisionInfo: {
          collisionType: ObjectCollisionFigureEnum.SQUARE,
          arrayFillValue: 1,
          centerPositionX: 950,
          centerPositionY: 1050,
          width: 64,
          height: 64,
        },
      },
      {
        imageInfo: {
          src: "./assets/spaceMain/object/bigTreeTop.png",
          type: ImageInfoEnum.TOP,
          unionPixelWidth: 352,
          unionPixelHeight: 440,
          centerPositionX: 1400,
          centerPositionY: 1400,
        },
      },
      {
        imageInfo: {
          src: "./assets/spaceMain/object/bigTreeBottom.png",
          type: ImageInfoEnum.OBJECT,
          unionPixelWidth: 352,
          unionPixelHeight: 440,
          centerPositionX: 1400,
          centerPositionY: 1400,
        },
        collisionInfo: {
          collisionType: ObjectCollisionFigureEnum.ELLIPSE,
          arrayFillValue: 1,
          centerPositionX: 1400,
          centerPositionY: 1500,
          width: 160,
          height: 128,
        },
      },
    ],
  },
  {
    name: "SeeAndMountainVer2",
    idx: 1,
    src: "./assets/spaceMain/background/SeeAndMountainVer2.png",
    width: 2400,
    height: 2400,
    objectInfos: [],
  },
];

export const animalMetaData = [
  {
    name: "brownHorse",
    idx: 0,
    imageInfos: [
      {
        src: "./assets/spaceMain/animal/brownHorseBody.png",
        type: ImageInfoEnum.BODY,
        unionPixelWidth: 136,
        unionPixelHeight: 208,
      },
      {
        src: "./assets/spaceMain/animal/brownHorseFaceMute.png",
        type: ImageInfoEnum.FACE_MUTE,
        unionPixelWidth: 136,
        unionPixelHeight: 208,
      },
      {
        src: "./assets/spaceMain/animal/brownHorseFaceSpeak.png",
        type: ImageInfoEnum.FACE_SPEAK,
        unionPixelWidth: 136,
        unionPixelHeight: 208,
      },
      {
        src: "./assets/spaceMain/animal/brownHorseFaceSpeakMouse.png",
        type: ImageInfoEnum.FACE_SPEAK_MOUSE,
        unionPixelWidth: 136,
        unionPixelHeight: 208,
      },
    ],
  },
  {
    name: "whiteRabbit",
    idx: 1,
    imageInfos: [
      {
        src: "./assets/spaceMain/animal/whiteRabbitBody.png",
        type: ImageInfoEnum.BODY,
        unionPixelWidth: 144,
        unionPixelHeight: 200,
      },
      {
        src: "./assets/spaceMain/animal/whiteRabbitFaceMute.png",
        type: ImageInfoEnum.FACE_MUTE,
        unionPixelWidth: 144,
        unionPixelHeight: 200,
      },
      {
        src: "./assets/spaceMain/animal/whiteRabbitFaceSpeak.png",
        type: ImageInfoEnum.FACE_SPEAK,
        unionPixelWidth: 144,
        unionPixelHeight: 200,
      },
      {
        src: "./assets/spaceMain/animal/whiteRabbitFaceSpeakMouse.png",
        type: ImageInfoEnum.FACE_SPEAK_MOUSE,
        unionPixelWidth: 144,
        unionPixelHeight: 200,
      },
    ],
  },
  {
    name: "brownBear",
    idx: 2,
    imageInfos: [
      {
        src: "./assets/spaceMain/animal/brownBearBody.png",
        type: ImageInfoEnum.BODY,
        unionPixelWidth: 192,
        unionPixelHeight: 200,
      },
      {
        src: "./assets/spaceMain/animal/brownBearFaceMute.png",
        type: ImageInfoEnum.FACE_MUTE,
        unionPixelWidth: 192,
        unionPixelHeight: 200,
      },
      {
        src: "./assets/spaceMain/animal/brownBearFaceSpeak.png",
        type: ImageInfoEnum.FACE_SPEAK,
        unionPixelWidth: 192,
        unionPixelHeight: 200,
      },
      {
        src: "./assets/spaceMain/animal/brownBearFaceSpeakMouse.png",
        type: ImageInfoEnum.FACE_SPEAK_MOUSE,
        unionPixelWidth: 192,
        unionPixelHeight: 200,
      },
    ],
  },
  {
    name: "pinkPig",
    idx: 3,
    imageInfos: [
      {
        src: "./assets/spaceMain/animal/pinkPigBody.png",
        type: ImageInfoEnum.BODY,
        unionPixelWidth: 176,
        unionPixelHeight: 200,
      },
      {
        src: "./assets/spaceMain/animal/pinkPigFaceMute.png",
        type: ImageInfoEnum.FACE_MUTE,
        unionPixelWidth: 176,
        unionPixelHeight: 200,
      },
      {
        src: "./assets/spaceMain/animal/pinkPigFaceSpeak.png",
        type: ImageInfoEnum.FACE_SPEAK,
        unionPixelWidth: 176,
        unionPixelHeight: 200,
      },
      {
        src: "./assets/spaceMain/animal/pinkPigFaceSpeakMouse.png",
        type: ImageInfoEnum.FACE_SPEAK_MOUSE,
        unionPixelWidth: 176,
        unionPixelHeight: 200,
      },
    ],
  },
];
