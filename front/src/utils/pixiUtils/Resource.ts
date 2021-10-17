import {Texture} from '@pixi/core';
import {Loader} from '@pixi/loaders';
import {Spritesheet} from '@pixi/spritesheet';

export class Resource {
  public static addSpriteSheet(resourceName: string, url: string): void {
    Loader.shared.add(resourceName, url);
  }

  public static getTexture(resourceName: string): Texture | undefined {
    return Loader.shared.resources[resourceName].texture;
  }

  public static getSpriteSheet(resourceName: string): Spritesheet | undefined {
    return Loader.shared.resources[resourceName].spritesheet;
  }

  public static getTextureFromSpriteSheet(
    textureName: string,
    sheetName: string,
  ): Texture | undefined {
    return Loader.shared.resources[sheetName].spritesheet?.textures[
      textureName
    ];
  }
}
