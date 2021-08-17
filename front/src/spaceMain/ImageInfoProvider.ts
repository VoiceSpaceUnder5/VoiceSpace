import {Vec2} from './RTCGameUtils';
import {
  ImageInfo,
  AnimalImageEnum,
  LayerLevelEnum,
  CollisionArrayFillValueEnum,
  AnimalPartImageEnum,
  makeWorldMap1,
  makeAnimalMap,
} from './ImageMetaData';

class ImageInfoProvider {
  objectsArray: ImageInfo[][];
  collisionArray: CollisionArrayFillValueEnum[][] | undefined;
  animalsMap: Map<AnimalImageEnum, Map<AnimalPartImageEnum, ImageInfo>>;

  constructor(gl: WebGLRenderingContext, backgroundIdx: number) {
    const layerLevelEnumLength = Object.keys(LayerLevelEnum).length; // 왜 2배로 나오는지 모르겠다.
    this.objectsArray = Array.from(Array(layerLevelEnumLength), () => Array(0));
    this.collisionArray = makeWorldMap1(this.objectsArray, gl);
    this.animalsMap = new Map();
    makeAnimalMap(this.animalsMap, gl);
    if (!this.collisionArray) return;
  }
  getAnimalImageInfo(
    animalEnum: AnimalImageEnum,
    animalPartEnum: AnimalPartImageEnum,
  ) {
    const result = this.animalsMap.get(animalEnum)?.get(animalPartEnum);
    if (!result) {
      //console.error('cannot find imageInfo from animalMap error');
    }
    return result;
  }
}

export default ImageInfoProvider;
