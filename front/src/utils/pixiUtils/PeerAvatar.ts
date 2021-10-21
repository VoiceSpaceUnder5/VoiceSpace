import {AvatarParts, Avatar} from './Avatar';
import {GameData} from './GameData';
import {World} from './World';
import {Viewport} from 'pixi-viewport';

export class PeerAvatar extends Avatar {
  public socketID: string;

  constructor(world: World, socketID: string, viewport: Viewport) {
    super(world, viewport);
    this.socketID = socketID;

    const centerPos = GameData.getPeerCenterPos(socketID);
    if (centerPos === undefined) {
      console.error("Error: This Peer's CenterPos undefined");
    }
    this.position.set(centerPos?.x, centerPos?.y);
  }

  update(): void {
    if (this.isAvatarChanged()) {
      const newAvatarImageEnum = GameData.getPeerAvatar(this.socketID);
      if (!newAvatarImageEnum) return;
      this.avatarImageEnum = newAvatarImageEnum;
      this.changeAvatar(this.getAvatarMD());
    }
    this.changePosition();
    this.changeZIndex();
    this.changePartRotationDegree();
    this.changeLookDirection();
    this.changeAvatarFace();
    this.changeAvatarFaceScale();
    this.changeDivPos();
    this.changeVolume();
    //Peer의 Avatar번호가 바뀌었으면 바꾸어준다. 아바타를
  }

  private changeVolume(): void {
    GameData.updateVolumeByDistance(this.socketID);
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

  private isAvatarChanged(): boolean {
    return this.avatarImageEnum !== GameData.getPeerAvatar(this.socketID);
  }

  private changeAvatarFace(): void {
    const avatarFace = GameData.getPeerAvatarFace(this.socketID);
    if (avatarFace === undefined) return;
    this.avatarFace = avatarFace;
    this.swapFace();
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
