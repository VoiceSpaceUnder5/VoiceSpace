import PeerManager from '../RTCGameUtils';
import {Avatar} from './Avatar';
import {MyAvatar} from './MyAvatar';

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

  public static updatePlayerDto(player: MyAvatar): void {
    const me = this.peerManager.me;

    me.centerPos.x = player.x;
    me.centerPos.y = player.y;
    me.partRotatedegree = player.partRotateDegree;
  }

  public static sendMyDto(): void {
    const me = this.peerManager.me;
    const peers = this.peerManager.peers;

    const data = JSON.stringify({type: 0, data: me.getPlayerDto()});
    peers.forEach(peer => {
      peer.transmitUsingDataChannel(data);
    });
  }
}
