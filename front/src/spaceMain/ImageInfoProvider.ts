import {Vec2} from './RTCGameUtils';
import {
  ImageInfo,
  AvatarImageEnum,
  LayerLevelEnum,
  AvatarPartImageEnum,
  makeWorldMap1,
  makeAvatarMap,
  PixelData,
} from './ImageMetaData';

class ImageInfoProvider {
  objects: Map<LayerLevelEnum, Map<number, ImageInfo>>; // objects[LayerLevelEnum][ImageInfoID]
  pixelInfos: PixelData[][] | undefined; //
  avatars: Map<AvatarImageEnum, Map<AvatarPartImageEnum, ImageInfo>>;

  constructor(gl: WebGLRenderingContext, backgroundIdx: number) {
    this.objects = new Map();
    this.avatars = new Map();
    this.pixelInfos = makeWorldMap1(this.objects, gl);
    makeAvatarMap(this.avatars, gl);
    if (!this.pixelInfos) return;
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
}

export default ImageInfoProvider;
