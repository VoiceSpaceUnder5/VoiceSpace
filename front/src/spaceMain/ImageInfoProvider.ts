import {Vec2} from './RTCGameUtils';
import {
  ImageInfo,
  AvatarImageEnum,
  LayerLevelEnum,
  AvatarPartImageEnum,
  makeWorldMap1,
  makeAvatarMap,
} from './ImageMetaData';

class ImageInfoProvider {
  objects: Map<LayerLevelEnum, Map<number, ImageInfo>>;
  pixelInfos: CollisionArrayFillValueEnum[][] | undefined;
  avatars: Map<AvatarImageEnum, Map<AvatarPartImageEnum, ImageInfo>>;

  constructor(gl: WebGLRenderingContext, backgroundIdx: number) {
    const layerLevelEnumLength = Object.keys(LayerLevelEnum).length; // 왜 2배로 나오는지 모르겠다.

    this.objectsArray = Array.from(Array(layerLevelEnumLength), () => Array(0));
    this.collisionArray = makeWorldMap1(this.objectsArray, gl);
    this.avatarsMap = new Map();
    makeAvatarMap(this.avatarsMap, gl);
    if (!this.collisionArray) return;
  }
  getAvatarImageInfo(
    avatarEnum: AvatarImageEnum,
    avatarPartEnum: AvatarPartImageEnum,
  ) {
    const result = this.avatarsMap.get(avatarEnum)?.get(avatarPartEnum);
    if (!result) {
      //console.error('cannot find imageInfo from avatarMap error');
    }
    return result;
  }
}

export default ImageInfoProvider;
