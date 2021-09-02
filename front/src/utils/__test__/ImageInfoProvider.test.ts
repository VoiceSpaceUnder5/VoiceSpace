import ImageInfoProvider from '../ImageInfoProvider';
import {seaAndMountainMap1MMI} from '../ImageMetaData';

const saveImage = window.Image;
let gl: any;

class mockedGL {
  createTexture(): any {
    return {};
  }
  bindTexture() {
    return;
  }
  texParameteri() {
    return;
  }
  texImage2D() {
    return;
  }
}

class mockedImage {
  onload: () => void;
  width: number;
  height: number;
  constructor() {
    this.onload = jest.fn();
    this.width = 0;
    this.height = 0;
  }
  set src(arg0: string) {
    this.onload();
  }

  addEventListener(arg0: string, onload: () => void) {
    this.onload = onload;
  }
}

beforeEach(() => {
  window.Image = mockedImage as any;
  gl = new mockedGL();
});

afterEach(() => {
  window.Image = saveImage;
  gl = null;
});

describe('ImageInfoProvider test', () => {
  test('avatar', async () => {
    if (!gl) {
      expect(false).toBeTruthy();
      return;
    }
    const setStatus = jest.fn();
    const imageInfoProvider = new ImageInfoProvider(
      gl,
      setStatus,
      seaAndMountainMap1MMI,
    );
    console.log(imageInfoProvider.avatars);
    const avatar = imageInfoProvider.getAvatarImageInfo(0, 0);
    expect(avatar).not.toBe(undefined);
  });
});
