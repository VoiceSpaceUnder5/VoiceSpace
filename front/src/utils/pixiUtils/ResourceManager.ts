import {Texture} from '@pixi/core';
import {Loader} from '@pixi/loaders';

export class ResourceManager {
  public static loadResourcesFrom(resourceUrls: string[]): void {
    resourceUrls.forEach(url => {
      this.add(url);
    });
  }

  public static run(callAfterLoaded: () => void): void {
    Loader.shared.load(callAfterLoaded);
  }

  public static add(jsonUrl: string): void {
    const resourceName = this.parseName(jsonUrl);
    if (!Loader.shared.resources[resourceName])
      Loader.shared.add(resourceName, jsonUrl);
  }

  public static setOnProgressCallback(
    callback: (loader: Loader) => void,
  ): void {
    Loader.shared.onProgress.add(callback);
  }

  public static setOnErrorCallback(callback: (error: Error) => void): void {
    Loader.shared.onError.add(callback);
  }

  private static parseName(url: string): string {
    const removeDirPath = url.substring(url.lastIndexOf('/') + 1);
    return removeDirPath;
  }

  public static getTexture(
    textureName: string,
    sheetName?: string,
  ): Texture | undefined {
    if (sheetName) {
      return Loader.shared.resources[sheetName].spritesheet?.textures[
        textureName
      ];
    } else return Loader.shared.resources[textureName].texture;
  }
}
