import {AvatarFaceEnum} from './metaData/ImageMetaData';
import PeerManager, {Vec2} from '../RTCGameUtils';
import {MyAvatar} from './MyAvatar';
import {World} from './World';
import {PeerAvatar} from './PeerAvatar';

export class GameData {
  private static peerManager: PeerManager;

  public static setPeerManager(peerManager: PeerManager): void {
    this.peerManager = peerManager;
  }

  public static getMyAvatar(): number {
    return this.peerManager.me.avatar;
  }
  public static getMyAvatarFace(): AvatarFaceEnum {
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
  ): AvatarFaceEnum | undefined {
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

  public static getPeerAvatarNicknameDiv(
    socketID: string,
  ): HTMLDivElement | undefined {
    if (!this.peerManager.peers.has(socketID)) {
      console.error("Error: There's No matching Peer ID");
      return undefined;
    }
    return this.peerManager.peers.get(socketID)?.nicknameDiv;
  }

  public static getPeerAvatarTextMessage(socketID: string): string | undefined {
    if (!this.peerManager.peers.has(socketID)) {
      console.error("Error: There's No matching Peer ID");
      return undefined;
    }
    return this.peerManager.peers.get(socketID)?.textMessage;
  }

  public static getPeerAvatarTextMessageDiv(
    socketID: string,
  ): HTMLDivElement | undefined {
    if (!this.peerManager.peers.has(socketID)) {
      console.error("Error: There's No matching Peer ID");
      return undefined;
    }
    return this.peerManager.peers.get(socketID)?.textMessageDiv;
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
      if (world.viewport !== null)
        world.addPeerAvatar(peer.connectedClientSocketID);
    });
  }

  public static setMyNicknameDivPos(
    player: MyAvatar | PeerAvatar,
    offsetY: number,
  ): void {
    const nicknameDiv = this.peerManager.me.nicknameDiv;
    const offsetX = nicknameDiv.clientWidth / 2;
    let vertical = player.y - offsetY;
    if (vertical < 0) vertical = 0;
    nicknameDiv.style.left = `${
      player.x * player.viewport.scale.x + player.viewport.x - offsetX
    }px`;
    nicknameDiv.style.top = `${
      vertical * player.viewport.scale.y + player.viewport.y
    }px`;
  }

  public static setMyTextMessageDivPos(
    player: MyAvatar | PeerAvatar,
    offsetY: number,
  ): void {
    const textMessageDiv = this.peerManager.me.textMessageDiv;
    textMessageDiv.className = 'canvasOverlay-textMessage-bottom';
    const offsetX = textMessageDiv.clientWidth / 2;
    let vertical = player.y - textMessageDiv.clientHeight - offsetY;
    if (vertical < 0) vertical = 0;
    textMessageDiv.style.left = `${
      player.x * player.viewport.scale.x + player.viewport.x - offsetX
    }px`;
    textMessageDiv.style.top = `${
      vertical * player.viewport.scale.y + player.viewport.y
    }px`;
  }

  public static isTextMessageExist(): boolean {
    return this.peerManager.me.textMessage !== '';
  }

  public static setDivPos(player: MyAvatar): void {
    if (this.isTextMessageExist()) {
      this.peerManager.me.nicknameDiv.style.visibility = 'hidden';
      this.peerManager.me.textMessageDiv.style.visibility = 'visible';
      this.setMyTextMessageDivPos(player, 130);
    } else {
      this.peerManager.me.nicknameDiv.style.visibility = 'visible';
      this.peerManager.me.textMessageDiv.style.visibility = 'hidden';
      this.setMyNicknameDivPos(player, 130);
    }
  }

  public static setPeerTextMessageDivPos(
    player: PeerAvatar,
    textMessageDiv: HTMLDivElement,
    offsetY: number,
  ): void {
    let tail = 'bottom';
    const viewport = player.viewport;
    let horizontal = player.x - textMessageDiv.clientWidth / 2;
    let vertical = player.y - textMessageDiv.clientHeight - offsetY;
    if (player.y > viewport.bottom) {
      vertical = viewport.bottom - textMessageDiv.clientHeight - 10;
    }
    if (player.x < viewport.left) {
      horizontal = viewport.left + 10;
      tail = 'left';
    }
    if (player.y - offsetY - textMessageDiv.clientHeight < viewport.top) {
      vertical = viewport.top + 10;
      tail = 'top';
    }
    if (player.x > viewport.right) {
      horizontal = viewport.right - textMessageDiv.clientWidth - 10;
      tail = 'right';
    }
    textMessageDiv.style.left = `${
      horizontal * viewport.scale.x + viewport.x
    }px`;
    textMessageDiv.style.top = `${vertical * viewport.scale.y + viewport.y}px`;
    textMessageDiv.className = `canvasOverlay-textMessage-${tail}`;
  }

  public static setPeerNicknameDivPos(
    player: PeerAvatar,
    nicknameDiv: HTMLDivElement,
    offsetY: number,
  ): void {
    const viewport = player.viewport;
    let horizontal = player.x - nicknameDiv.clientWidth / 2;
    let vertical = player.y - offsetY;
    if (player.y > viewport.bottom) {
      vertical = viewport.bottom - nicknameDiv.clientHeight;
    }
    if (player.x < viewport.left) {
      horizontal = viewport.left;
    }
    if (player.y < viewport.top) {
      vertical = viewport.top;
    }
    if (player.x > viewport.right) {
      horizontal = viewport.right - nicknameDiv.clientWidth;
    }
    if (vertical < 0) vertical = 0;
    nicknameDiv.style.left = `${horizontal * viewport.scale.x + viewport.x}px`;
    nicknameDiv.style.top = `${vertical * viewport.scale.y + viewport.y}px`;
  }

  public static divVisibleOnOff(
    toOn: HTMLDivElement,
    toOff: HTMLDivElement,
  ): void {
    toOn.style.visibility = 'visible';
    toOff.style.visibility = 'hidden';
  }
}
