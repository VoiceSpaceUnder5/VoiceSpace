import {Application} from '@pixi/app';
import {Loader} from '@pixi/loaders';
import {Resource} from '../Resource';
import {assets} from './../assets_meta';
describe('Assets Parsing Test', () => {
  test('정상적인 스프라이트 시트 읽고 리소스를 텍스쳐 리소스에 저장', () => {
    const app = new Application();
    Loader.shared.add(assets).load(() => {
      // Resource.add('bunnyArm', './assets/bunnyArm.png');
      console.log(Loader.shared.resources['bunnyArm'].texture);
    });
    expect(Loader.shared.resources['bunnyArm'].texture).toBeDefined();
  });
});
