import ImageInfoProvider from '../ImageInfoProvider';
import {avatarImageMDs, MapMakingInfo, whiteRabbitMD} from '../ImageMetaData';

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

const mockedMMI: MapMakingInfo = {
  backgroundSize: {width: 2000, height: 2400},
  respawnPosition: {x: 1200, y: 1200},
  makingFunc: jest.fn(),
};

beforeEach(() => {
  window.Image = mockedImage as any;
  gl = new mockedGL();
});

afterEach(() => {
  window.Image = saveImage;
  gl = null;
});

describe('ImageInfoProvider test', () => {
  test('imageInfoProvider 가 생성 된 후, 3번째 매개변수의 makingFunc 함수가 실행되어야 함.', async () => {
    if (!gl) {
      expect(false).toBeTruthy();
      return;
    }
    const setStatus = jest.fn();
    const imageInfoProvider = new ImageInfoProvider(gl, setStatus, mockedMMI);
    expect(mockedMMI.makingFunc).toBeCalledTimes(1);
  });

  test('imageInfoProvider 가 생성 된 후, 모든 동물 아바타들이 로딩 되어야 함.', async () => {
    if (!gl) {
      expect(false).toBeTruthy();
      return;
    }
    const setStatus = jest.fn();

    const imageInfoProvider = new ImageInfoProvider(gl, setStatus, mockedMMI);
    expect(imageInfoProvider.avatars.size).toBe(avatarImageMDs.length); // 모든 아바타가 로딩되어야 함.
    imageInfoProvider.avatars.forEach(value => {
      // 각각의 아바타의 모든 부위가 로딩되어야 함.
      expect(value.size).toBe(whiteRabbitMD.avatarMDInfos.length);
    });
  });

  test('imageInfoProvider 가 생성 된 후, setStatus 함수는 모든 아바타 수 * 2 만큼 로딩되어야 함.', async () => {
    if (!gl) {
      expect(false).toBeTruthy();
      return;
    }
    const setStatus = jest.fn();

    const imageInfoProvider = new ImageInfoProvider(gl, setStatus, mockedMMI);
    expect(setStatus).toBeCalledTimes(
      avatarImageMDs.length * whiteRabbitMD.avatarMDInfos.length * 2,
    );
  });

  test('imageInfoProvider 가 생성 된 후, pixelInfos 의 크기는 MMI의 size 어야 함.', async () => {
    if (!gl) {
      expect(false).toBeTruthy();
      return;
    }
    const setStatus = jest.fn();

    const imageInfoProvider = new ImageInfoProvider(gl, setStatus, mockedMMI);
    expect(imageInfoProvider.pixelInfos.length).toBe(
      mockedMMI.backgroundSize.width,
    );
    expect(imageInfoProvider.pixelInfos[0].length).toBe(
      mockedMMI.backgroundSize.height,
    );
  });
});
