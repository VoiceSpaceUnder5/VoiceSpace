import {Avatar, AvatarParts, avatarName} from './Avatar';
import {DisplayContainer} from './DisplayContainer';
import { GameData } from './GameData';
import {World} from './World';

export class PeerAvatar extends DisplayContainer implements Avatar {
  public avatar: number;
  public partRotateDegree: number;

  constructor(world: World) {
    super(world);

    this.avatar = 0;
    this.partRotateDegree = 0;
    //this.addChild(part)
    const partsTextureNames = [
      avatarName[this.avatar] + 'Arm',
      avatarName[this.avatar] + 'Arm',
      avatarName[this.avatar] + 'Body',
      avatarName[this.avatar] + 'Arm',
      avatarName[this.avatar] + 'Arm',
      avatarName[this.avatar] + 'Head',
    ];
    this.addParts(partsTextureNames);
    this.setUpdate(this.updatePeerAvatar);
    this.parts.forEach(value => {
      this.addChild(value);
    });

    this.setPartsPosition();
  }

  //setter
  private setPartsPosition() {
    this.parts[AvatarParts.HEAD].anchor.set(0.45, 0.95);
    this.parts[AvatarParts.BODY].anchor.set(0.5, 0);

    this.parts[AvatarParts.LEFT_ARM].anchor.set(0.5, 0.2);
    this.parts[AvatarParts.LEFT_ARM].position.set(8, 5);

    this.parts[AvatarParts.LEFT_LEG].anchor.set(0.5, 0.2);
    this.parts[AvatarParts.LEFT_LEG].position.set(9, 42);

    this.parts[AvatarParts.RIGHT_ARM].anchor.set(0.5, 0.2);
    this.parts[AvatarParts.RIGHT_ARM].position.set(-8, 5);

    this.parts[AvatarParts.RIGHT_LEG].anchor.set(0.5, 0.2);
    this.parts[AvatarParts.RIGHT_LEG].position.set(-8, 42);
  }

  updatePeerAvatar() {

  }
  changePosition() {
	  GameData.
  }
}
