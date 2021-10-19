import {Sprite} from '@pixi/sprite';
import {AvatarFaceEnum} from '../ImageMetaData';
import {Avatar, AvatarParts, newAvatar, swapFace} from './Avatar';
import {DisplayContainer} from './DisplayContainer';
import {GameData} from './GameData';
import {World} from './World';
import {Viewport} from 'pixi-viewport';
import avatarMD from './metaData/avatars.json';

export class PeerAvatar extends DisplayContainer implements Avatar {
  public avatar: number;
  public avatarFace: AvatarFaceEnum;
  public avatarFaceScale: number;
  public partRotateDegree: number[];
  public socketID: string;
  public viewport: Viewport;

  constructor(world: World, socketID: string, viewport: Viewport) {
    super(world);

    const avatar = GameData.getPeerAvatar(socketID);
    if (avatar === undefined) {
      console.error("Error: This Peer's Avatar undefined");
    }
    this.avatar = avatar || 0;
    this.avatarFace = AvatarFaceEnum.FACE_MUTE;
    this.avatarFaceScale = 1.0;
    this.partRotateDegree = Array.from({length: 6}, () => 0);
    this.socketID = socketID;
    this.viewport = viewport;

    const centerPos = GameData.getPeerCenterPos(socketID);
    if (centerPos === undefined) {
      console.error("Error: This Peer's CenterPos undefined");
    }
    this.position.set(centerPos?.x, centerPos?.y);

    //this.addChild(part)
    newAvatar(this, avatarMD.bunny);
  }

  update(): void {
    this.changePosition();
    this.changeZIndex();
    this.changePartRotationDegree();
    this.changeLookDirection();
    this.changeAvatarFace();
    this.changeAvatarFaceScale();
    this.changeDivPos();
    //Peer의 Avatar번호가 바뀌었으면 바꾸어준다. 아바타를
    // Peer의 scale을 받아서 얼굴에 적용한다.
    // Peer의 AvatarFace를 받아서 얼굴에 적용한다.
  }

  private changePosition(): void {
    const centerPos = GameData.getPeerCenterPos(this.socketID);
    this.position.set(centerPos?.x, centerPos?.y);
  }

  private changeZIndex(): void {
    this.zIndex = this.y + this.height / 2;
  }

  private changePartRotationDegree(): void {
    const partRotateDegree = GameData.getPeerPartRotateDegree(this.socketID);
    if (partRotateDegree !== undefined)
      this.partRotateDegree = partRotateDegree;
    if (partRotateDegree)
      for (let i = 0; i < 6; ++i) {
        this.parts[i].angle = partRotateDegree[i];
      }
  }

  private changeLookDirection(): void {
    const lookLeft = GameData.getPeerAvatarLookLeft(this.socketID);
    if (lookLeft === undefined) return;
    this.scale.x = lookLeft ? -1 : 1;
  }

  private changeAvatarFace(): void {
    const avatarFace = GameData.getPeerAvatarFace(this.socketID);
    if (avatarFace === undefined) return;
    this.avatarFace = avatarFace;
    swapFace(
      this.avatar,
      this.children[AvatarParts.FACE] as Sprite,
      this.avatarFace,
    );
  }

  private changeAvatarFaceScale(): void {
    const avatarFaceScale = GameData.getPeerAvatarFaceScale(this.socketID);
    if (avatarFaceScale === undefined) return;
    this.avatarFaceScale = avatarFaceScale;
    this.parts[AvatarParts.FACE].scale.set(this.avatarFaceScale);
  }

  private changeDivPos(): void {
    const position = GameData.getPeerCenterPos(this.socketID);
    const nicknameDiv = GameData.getPeerAvatarNicknameDiv(this.socketID);
    const textMessage = GameData.getPeerAvatarTextMessage(this.socketID);
    const textMessageDiv = GameData.getPeerAvatarTextMessageDiv(this.socketID);

    if (!position || !nicknameDiv || !textMessageDiv) return;
    if (textMessage) {
      GameData.divVisibleOnOff(textMessageDiv, nicknameDiv);
      GameData.setPeerTextMessageDivPos(this, textMessageDiv, 130);
    } else {
      GameData.divVisibleOnOff(nicknameDiv, textMessageDiv);
      GameData.setPeerNicknameDivPos(this, nicknameDiv, 130);
    }
    return;
  }
}
