import {Texture} from '@pixi/core';
import {Loader} from '@pixi/loaders';

export class ResourceManager {
  public static add(jsonUrl: string): void {
    Loader.shared.add(this.parseName(jsonUrl), jsonUrl);
  }

  private static parseName(url: string): string {
    const removeDirPath = url.substring(url.lastIndexOf('/') + 1);
    return removeDirPath;
  }

  public static getTextureFromSheet(
    textureName: string,
    sheetName: string,
  ): Texture | undefined {
    return Loader.shared.resources[sheetName].spritesheet?.textures[
      textureName
    ];
  }

  public static getTexture(textureName: string): Texture | undefined {
    return Loader.shared.resources[textureName].texture;
  }
}