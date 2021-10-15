import {AvatarPartImageEnum} from '../ImageMetaData';
import PeerManager, {Vec2} from '../RTCGameUtils';
import {Avatar} from './Avatar';
import {MyAvatar} from './MyAvatar';
import {World} from './World';

export class GameData {
  private static peerManager: PeerManager;

  public static setPeerManager(peerManager: PeerManager): void {
    this.peerManager = peerManager;
  }

  //test용 - 삭제 예정
  public static testPrint(): void {
    // console.log(this.peerManager);
    console.log(this.peerManager.peers);
  }

  public static getMyAvatar(): number {
    return this.peerManager.me.avatar;
  }
  public static getMyAvatarFace(): AvatarPartImageEnum {
    return this.peerManager.me.audioAnalyser.getAvatarFaceDtoByAudioAnalysis()
      .avatarFace;
  }

  public static getMyAvatarFaceScale(): number {
    return this.peerManager.me.audioAnalyser.getAvatarFaceDtoByAudioAnalysis()
      .avatarFaceScale;
  }

  public static updatePlayerDto(player: MyAvatar): void {
    const me = this.peerManager.me;

    me.centerPos.x = player.x;
    me.centerPos.y = player.y;
    me.partRotatedegree = player.partRotateDegree;
    me.lookLeft = player.scale.x < 0;
    me.avatarFace = player.avatarFace;
    me.avatarFaceScale = player.avatarFaceScale;
  }

  public static sendMyDto(): void {
    const me = this.peerManager.me;
    const peers = this.peerManager.peers;

    const data = JSON.stringify({type: 0, data: me.getPlayerDto()});
    peers.forEach(peer => {
      peer.transmitUsingDataChannel(data);
    });
  }

  public static getPeerNickName(socketID: string): string | undefined {
    if (this.peerManager.peers.get(socketID) === undefined) {
      console.error("Error: There's No matching Peer ID");
      return undefined;
    }
    return this.peerManager.peers.get(socketID)?.nickname;
  }

  public static getPeerCenterPos(socketID: string): Vec2 | undefined {
    if (this.peerManager.peers.get(socketID) === undefined) {
      console.error("Error: There's No matching Peer ID");
      return undefined;
    }
    return this.peerManager.peers.get(socketID)?.centerPos;
  }

  public static getPeerPartRotateDegree(
    socketID: string,
  ): number[] | undefined {
    if (this.peerManager.peers.get(socketID) === undefined) {
      console.error("Error: There's No matching Peer ID");
      return undefined;
    }
    return this.peerManager.peers.get(socketID)?.partRotatedegree;
  }

  public static getPeerAvatar(socketID: string): number | undefined {
    if (this.peerManager.peers.get(socketID) === undefined) {
      console.error("Error: There's No matching Peer ID");
      return undefined;
    }
    return this.peerManager.peers.get(socketID)?.avatar;
  }

  public static getPeerAvatarFace(
    socketID: string,
  ): AvatarPartImageEnum | undefined {
    if (!this.peerManager.peers.has(socketID)) {
      console.error("Error: There's No matching Peer ID");
      return undefined;
    }
    return this.peerManager.peers.get(socketID)?.avatarFace;
  }

  public static getPeerAvatarFaceScale(socketID: string): number | undefined {
    if (!this.peerManager.peers.has(socketID)) {
      console.error("Error: There's No matching Peer ID");
      return undefined;
    }
    return this.peerManager.peers.get(socketID)?.avatarFaceScale;
  }

  public static getPeerAvatarLookLeft(socketID: string): boolean | undefined {
    if (!this.peerManager.peers.has(socketID)) {
      console.error("Error: There's No matching Peer ID");
      return undefined;
    }
    return this.peerManager.peers.get(socketID)?.lookLeft;
  }

  public static isConnectionAlive(socketID: string): boolean {
    if (this.peerManager.peers.get(socketID) === undefined) return false;
    else return true;
  }

  public static addOnPeerCreatedHandler(
    handler: (createdPeerSocketID: string) => void,
  ): void {
    this.peerManager.onPeerCreated = handler;
  }

  public static addOnPeerDeletedHandler(
    handler: (deletedPeerSocketID: string) => void,
  ): void {
    this.peerManager.onPeerDeleted = handler;
  }

  public static addExistingPeers(world: World): void {
    this.peerManager.peers.forEach(peer => {
      world.addPeerAvatar(peer.connectedClientSocketID);
    });
  }
}
