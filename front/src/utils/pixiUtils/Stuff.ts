import {Sprite} from '@pixi/sprite';
import {checkIntersect} from './CheckIntersect';
import {DisplayContainer} from './DisplayContainer';
import {ResourceManager} from './ResourceManager';
import {World} from './World';
import {StuffData, YoutubeStuffData} from './metaData/DataInterface';
import {CollisionBox} from './CollisionBox';
import {DisplayObject} from 'pixi.js';
import YoutubeEmbedRenderer from '../../components/YoutubeEmbed';

export class Stuff extends DisplayContainer {
  protected alphaChangable = true;

  constructor(world: World, data: StuffData) {
    super(world);

    if (data.position) this.position.set(data.position.x, data.position.y);
    data.parts.forEach(part => {
      const texture = ResourceManager.getTexture(
        part.textureName,
        part.spriteSheet,
      );
      if (!texture) return;
      this.alphaChangable = data.alphaChangable;
      const sprite = Sprite.from(texture);
      sprite.position.set(part.position.x, part.position.y);
      sprite.anchor.set(part.anchor.x, part.anchor.y);
      this.addChild(sprite);

      if (data.collisionBox) this.addCollisionBox(data.collisionBox);
    });
    this.zIndex = this.y;
  }

  update(): void {
    if (this.alphaChangable) this.changeAlpha();
  }

  protected changeAlpha(): void {
    if (this.world.player === null) return;
    if (this.world.player.collisionBox === null) return;
    if (checkIntersect(this.world.player.collisionBox, this)) {
      this.alpha = 0.5;
    } else this.alpha = 1;
  }
}

interface IInteractStuff {
  interact: (target: DisplayObject) => void; //
}

export class YoutubeStuff extends Stuff implements IInteractStuff {
  private interactBox: CollisionBox;
  private youtubeContainer: HTMLDivElement | null;
  private youtubeVideoID: string;
  private youtubeContainerTopPosition: number;
  private youtubeContainerLeftPosition: number;
  constructor(world: World, data: YoutubeStuffData) {
    super(world, data);
    this.interactBox = new CollisionBox(data.interactBox);
    this.addChild(this.interactBox);
    this.youtubeVideoID = data.youtubeVideoID;
    this.youtubeContainerLeftPosition = data.youtubeContainerLeftPosition;
    this.youtubeContainerTopPosition = data.youtubeContainerTopPosition;
    this.youtubeContainer = null;
  }
  interact(target: DisplayObject): void {
    if (this.isReadyToInteract(target)) this.interactStart();
    else this.interactEnd();
  }
  interactStart(): void {
    if (!this.youtubeContainer) {
      this.youtubeContainer = YoutubeEmbedRenderer.render({
        left: this.youtubeContainerLeftPosition,
        top: this.youtubeContainerTopPosition,
        videoID: this.youtubeVideoID,
      });
    }
  }
  interactEnd(): void {
    if (this.youtubeContainer) {
      YoutubeEmbedRenderer.delete(this.youtubeContainer);
      this.youtubeContainer = null;
    }
  }
  isReadyToInteract(target: DisplayObject): boolean {
    return checkIntersect(target, this.interactBox as DisplayObject);
  }
  changeAlpha(): void {
    if (this.world.player && this.world.player.collisionBox) {
      if (checkIntersect(this.world.player.collisionBox, this.children[0])) {
        this.alpha = 0.5;
      } else this.alpha = 1;
    } else this.alpha = 1;
  }
  update(): void {
    if (this.alphaChangable) this.changeAlpha();
    if (this.world.player && this.world.player.collisionBox)
      this.interact(this.world.player.collisionBox);
  }
}
