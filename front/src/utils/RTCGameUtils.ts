import GLHelper from './webGLUtils';
import {AvatarImageEnum, AvatarPartImageEnum} from './ImageMetaData';
import RTCSignalingHelper, {IceDto, OfferAnswerDto} from './RTCSignalingHelper';

/**
 * position 등 x, y 두 변수를 가지고 있을 때 주로 사용
 */
export interface Vec2 {
  x: number;
  y: number;
}

/**
 * AudioAnalyser 인스턴스의 getAvatarFaceDtoByAudioAnalysis() 메소드의 output
 * avatarFace 중 어떤 형태의 face 를 적용할지와 얼만큼의 scale 로 적용할지에 대한 정보를 담음.
 */
export interface AvatarFaceDto {
  avatarFace: AvatarPartImageEnum;
  avatarFaceScale: number;
}

/**
 * player 를 대표하는 아바타정보
 * p2p dataChannel 을 통해 지속적으로 전송되는 정보.
 */
export interface PlayerDto extends AvatarFaceDto {
  nickname: string;
  avatar: AvatarImageEnum;
  centerPos: Vec2;
  rotateRadian: number;
}

/**
 * LocalAudioMediaStream 을 분석하여 avatarFace 를 어떻게 그려야 할지 결정해주는 책임을 가짐
 *
 */
export class AudioAnalyser {
  private analyser: AnalyserNode;
  // value // 추후 자음을 분석하여 입모양을 결정하는 부분이 합쳐질 경우 변경될 가능성이 높음
  private readonly speakThrashHold: number;
  private readonly speakMouseThrashHold: number;
  private readonly volumeDivideValue: number;

  // for audio Analysis
  private readonly byteFrequencyDataArray: Uint8Array;

  constructor(
    stream: MediaStream, // audio
    volumeDivideValue = 250,
    speakThrashHold = 30,
    speakMouseThrashHold = 50,
  ) {
    // make analyser with stream
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    this.analyser = audioContext.createAnalyser();
    this.analyser.smoothingTimeConstant = 0.4;
    this.analyser.fftSize = 1024;
    source.connect(this.analyser);

    // value
    this.volumeDivideValue = volumeDivideValue;
    this.speakThrashHold = speakThrashHold;
    this.speakMouseThrashHold = speakMouseThrashHold;

    // for audio Analysis
    this.byteFrequencyDataArray = new Uint8Array(
      this.analyser.frequencyBinCount,
    );
  }

  getAvatarFaceDtoByAudioAnalysis(): AvatarFaceDto {
    this.analyser.getByteFrequencyData(this.byteFrequencyDataArray);
    // get volume
    const volume =
      this.byteFrequencyDataArray.reduce((acc, cur) => {
        return acc + cur;
      }, 0) / this.byteFrequencyDataArray.length;

    // get avatarFaceEnum by volume
    let avatarFace = AvatarPartImageEnum.FACE_MUTE;
    if (volume > this.speakThrashHold)
      avatarFace = AvatarPartImageEnum.FACE_SPEAK;
    if (volume > this.speakMouseThrashHold)
      avatarFace = AvatarPartImageEnum.FACE_SPEAK_SMILE;

    // get avatarFace scale by volume and volumeDivideValue
    const scale = 1 + volume / this.volumeDivideValue;
    return {
      avatarFace: avatarFace,
      avatarFaceScale: scale,
    };
  }
}

/**
 * 책임 : 자기 avatar 의 모든 정보를 가지고 있고, update 가 호출되면 현재 위치, 방향 등의 정보를 업데이트함
 * 내부적으로 AudioAnalyser 를 가지고 연결된 peer 들에게 전송해야 되는 데이터를 output 함
 */
export class Me implements PlayerDto {
  // PlayerDto
  private _nickname: string; //외부에서 변경하는 것이 아니라, setter 를 통해서 변경. setter 에서는 nickname 이 변경되면 nicknameDiv 의 innerText 도 같이 변경함.
  avatar: AvatarImageEnum;
  avatarFace: AvatarPartImageEnum;
  avatarFaceScale: number;
  centerPos: Vec2;
  rotateRadian: number;

  //nickname overlay div
  nicknameDiv: HTMLDivElement;

  // update avatar position values
  private lastUpdateTimeStamp: number;
  private readonly velocity: number;
  private normalizedDirectionVector: Vec2;
  nextNormalizedDirectionVector: Vec2;
  isMoving: boolean;

  // AudioAnalyser
  private readonly audioAnalyser: AudioAnalyser;
  constructor(
    nicknameDiv: HTMLDivElement,
    audioAnalyser: AudioAnalyser,
    centerPos: Vec2, // original centerPos
    nickname = '익명의 곰', // 추후 .env 로 이동해야 될듯 (하드코딩 제거)
    avatar = AvatarImageEnum.BROWN_BEAR,
    velocity = 0.2,
  ) {
    //nickname overlay div
    this.nicknameDiv = nicknameDiv;

    // PlayerDto
    this._nickname = nickname;
    this.nickname = nickname;
    this.avatar = avatar;
    this.avatarFace = AvatarPartImageEnum.FACE_MUTE;
    this.avatarFaceScale = 1;
    this.centerPos = {...centerPos};
    this.rotateRadian = 0;

    // update avatar position values
    this.lastUpdateTimeStamp = Date.now();
    this.velocity = velocity;
    this.normalizedDirectionVector = {x: 0, y: 1};
    this.nextNormalizedDirectionVector = {x: 0, y: 1};
    this.isMoving = false;

    // AudioAnalyser
    this.audioAnalyser = audioAnalyser;
  }

  set nickname(nickname: string) {
    this._nickname = nickname;
    this.nicknameDiv.innerText = nickname;
  }

  get nickname(): string {
    return this._nickname;
  }

  getPlayerDto(): PlayerDto {
    return {
      nickname: this._nickname,
      avatar: this.avatar,
      avatarFace: this.avatarFace,
      avatarFaceScale: this.avatarFaceScale,
      centerPos: {...this.centerPos},
      rotateRadian: this.rotateRadian,
    };
  }

  private isCollision(glHelper: GLHelper): boolean {
    const vertex4: Vec2[] = glHelper.getMy4VertexWorldPosition(this, 0.8);
    if (!glHelper.imageInfoProvider.pixelInfos) return false;
    for (let i = 0; i < vertex4.length; i++) {
      let left = vertex4[i];
      let right = i < vertex4.length - 1 ? vertex4[i + 1] : vertex4[0];
      if (left.x > right.x) {
        const temp = left;
        left = right;
        right = temp;
      }
      const a = (right.y - left.y) / (right.x - left.x);
      for (let i = 0; i < right.x - left.x; i++) {
        const posX = Math.round(left.x + i);
        const posY = Math.round(left.y + a * i);
        if (
          posX < 0 ||
          posX >= glHelper.imageInfoProvider.pixelInfos.length ||
          posY < 0 ||
          posY >= glHelper.imageInfoProvider.pixelInfos[0].length ||
          glHelper.imageInfoProvider.pixelInfos[posX][posY].collisionInfoKey !==
            0
        ) {
          return true;
        }
      }
    }
    return false;
  }

  update(glHelper: GLHelper): void {
    const avatarFaceDto = this.audioAnalyser.getAvatarFaceDtoByAudioAnalysis();
    this.avatarFaceScale = avatarFaceDto.avatarFaceScale;
    this.avatarFace = avatarFaceDto.avatarFace;

    const millisDiff = Date.now() - this.lastUpdateTimeStamp;
    this.lastUpdateTimeStamp = Date.now();

    if (this.isMoving) {
      // saveOldValue
      const oldCenterPosX = this.centerPos.x;
      const oldCenterPosY = this.centerPos.y;
      const oldnormalizedDirectionVectorX = this.normalizedDirectionVector.x;
      const oldnormalizedDirectionVectorY = this.normalizedDirectionVector.y;
      const oldRotateRadian = this.rotateRadian;

      // position value update
      this.normalizedDirectionVector = {...this.nextNormalizedDirectionVector};
      this.centerPos.x +=
        this.velocity * this.normalizedDirectionVector.x * millisDiff;
      this.centerPos.y +=
        this.velocity * this.normalizedDirectionVector.y * millisDiff;
      this.rotateRadian = Math.atan2(
        this.normalizedDirectionVector.x,
        this.normalizedDirectionVector.y,
      );
      //collision detection part
      if (this.isCollision(glHelper)) {
        // if isCollision -> rollback value
        this.centerPos.x = oldCenterPosX;
        this.centerPos.y = oldCenterPosY;
        this.normalizedDirectionVector.x = oldnormalizedDirectionVectorX;
        this.normalizedDirectionVector.y = oldnormalizedDirectionVectorY;
        this.rotateRadian = oldRotateRadian;
      }
    }
  }
}

/**
 * 책임 : Peer 간 연결을 수립하여 localStream 전송한다.
 * Peer 간 연결을 통해 remoteStream 이 도착하면 AudioElement 에 업데이트한다.
 * dataChannel 을 통해 playerDto 를 받아서 자신의 상태를 계속하여 업데이트한다.
 * dataChannel 을 통해 연결된 peer 에게 me 의 상태를 전송한다.
 */
export class Peer extends RTCPeerConnection implements PlayerDto {
  // for signaling
  readonly connectedClientSocketID: string;
  readonly socketID: string;

  // for dataChannel
  private readonly dc: RTCDataChannel;

  // for audio stream
  audio: HTMLAudioElement;
  volumnMultiplyValue: number;

  // for sound control by distance between peer and peer
  maxSoundDistance: number;

  // PlayerDto
  nickname: string; //외부에서 변경하는 것이 아니라, setter 를 통해서 변경. setter 에서는 nickname 이 변경되면 nicknameDiv 의 innerText 도 같이 변경함.
  avatar: AvatarImageEnum;
  avatarFace: AvatarPartImageEnum;
  avatarFaceScale: number;
  centerPos: Vec2;
  rotateRadian: number;

  //nickname overlay div
  nicknameDiv: HTMLDivElement;

  constructor(
    signalingHelper: RTCSignalingHelper,
    connectedClientSocketID: string,
    localStream: MediaStream,
    audio: HTMLAudioElement,
    nicknameDiv: HTMLDivElement,
    connectionClosedDisconnectedFailedCallBack: (peer: Peer) => void,
    pcConfig: RTCConfiguration,
    maxSoundDistance = 500,
  ) {
    super(pcConfig);
    // for signaling
    this.connectedClientSocketID = connectedClientSocketID;
    this.socketID = signalingHelper.getSocketID();

    // for dataChannel
    this.dc = this.createDataChannel('dc');

    // for audio stream
    this.audio = audio;
    this.volumnMultiplyValue = 1;

    // for sound control by distance between peer and peer
    this.maxSoundDistance = maxSoundDistance;

    // PlayerDto
    this.nickname = 'Loading...';
    this.avatar = AvatarImageEnum.BROWN_BEAR;
    this.avatarFace = AvatarPartImageEnum.FACE_MUTE;
    this.avatarFaceScale = 1;
    this.centerPos = {x: -1000, y: -1000};
    this.rotateRadian = 0;

    //nickname overlay div
    this.nicknameDiv = nicknameDiv;

    // connect localStream
    localStream.getTracks().forEach(track => {
      this.addTrack(track, localStream);
    });

    // event setting
    this.setEvent(signalingHelper, connectionClosedDisconnectedFailedCallBack);
  }

  private setEvent(
    signalingHelper: RTCSignalingHelper,
    connectionClosedDisconnectedFailedCallBack: (peer: Peer) => void,
  ): void {
    // fire when peer connection is established
    this.ondatachannel = event => {
      const receviedDC = event.channel;
      receviedDC.onmessage = event => {
        const data = JSON.parse(event.data) as PlayerDto;
        this.update(data);
      };
      receviedDC.onopen = () => {
        console.log(`dataChannel created with ${this.connectedClientSocketID}`);
      };
      receviedDC.onclose = () => {
        console.log(`dataChannel closed with ${this.connectedClientSocketID}`);
      };
    };

    // iceCandidate 이벤트는 setLocalDescripton 이후 지속적으로 호출됩니다.
    this.addEventListener('icecandidate', event => {
      const iceCandidate = event.candidate;
      // iceCandidate 가 null 인 경우는 last iceCandidate 이후에 이벤트가 한번더 호출되었을 때 이다.
      if (iceCandidate) {
        const iceDto: IceDto = {
          toClientId: this.connectedClientSocketID,
          fromClientId: this.socketID,
          ice: iceCandidate,
        };
        signalingHelper.emitIce(iceDto);
      }
    });

    this.addEventListener('track', event => {
      this.audio.srcObject = event.streams[0];
    });

    this.addEventListener('connectionstatechange', () => {
      if (
        this.connectionState === 'closed' ||
        this.connectionState === 'disconnected' ||
        this.connectionState === 'failed'
      ) {
        connectionClosedDisconnectedFailedCallBack(this);
      }
    });
  }

  update(data: PlayerDto): void {
    this.centerPos = data.centerPos;
    this.nickname = data.nickname;
    this.avatar = data.avatar;
    this.avatarFace = data.avatarFace;
    this.avatarFaceScale = data.avatarFaceScale;
    this.rotateRadian = data.rotateRadian;
    this.nicknameDiv.innerText = data.nickname;
  }

  updateSoundFromVec2(pos: Vec2): void {
    const distance = Math.sqrt(
      Math.pow(this.centerPos.x - pos.x, 2) +
        Math.pow(this.centerPos.y - pos.y, 2),
    );
    const volumeValue = Math.max(0, 1 - distance / this.maxSoundDistance);
    this.audio.volume = volumeValue * this.volumnMultiplyValue;
  }

  transmitUsingDataChannel(data: string): void {
    if (this.dc.readyState === 'open') {
      this.dc.send(data);
    } else {
      //   console.error(
      //     `${this.connectedClientSocketID} dataChannel is not opened`,
      //   );
    }
  }
}

/**
 * 책임 : 내부적으로 Me 를 가지고 있으며
 * signalingHelper 의 이벤트마다 적절하게 peer 를 새로 생성하거나,
 * 이미 생성되어 있는 peer 의 이벤트의 맞는 메소드를 실행 시킨다.
 */
export default class PeerManager {
  // create new Peer params
  private readonly signalingHelper: RTCSignalingHelper;
  readonly localStream: MediaStream;
  private readonly audioContainer: HTMLDivElement;
  readonly nicknameContainer: HTMLDivElement;
  private readonly connectionClosedDisconnectedFailedCallBack: (
    peer: Peer,
  ) => void;
  private readonly pcConfig: RTCConfiguration;

  // peer container
  peers: Map<string, Peer>;

  // Me
  me: Me;

  // RoomID
  readonly roomID: string;
  constructor(
    signalingHelper: RTCSignalingHelper,
    localStream: MediaStream,
    audioContainer: HTMLDivElement,
    nicknameContainer: HTMLDivElement,
    pcConfig: RTCConfiguration,
    roomID: string,
    me: Me,
  ) {
    // create new Peer params
    this.signalingHelper = signalingHelper;
    this.localStream = localStream;
    this.audioContainer = audioContainer;
    this.nicknameContainer = nicknameContainer;
    this.connectionClosedDisconnectedFailedCallBack = (peer: Peer): void => {
      if (this.peers.get(peer.connectedClientSocketID)) {
        this.peers.delete(peer.connectedClientSocketID);
        this.audioContainer.removeChild(peer.audio);
        this.nicknameContainer.removeChild(peer.nicknameDiv);
      }
    };
    this.pcConfig = pcConfig;

    // peer container
    this.peers = new Map<string, Peer>();

    // Me
    this.me = me;

    // roomID
    this.roomID = roomID;

    // setEvent
    this.setSignalingEvent();

    // JoinRoom
    this.signalingHelper.joinRoom(roomID);
  }

  forEachPeer(callback: (peer: Peer) => void): void {
    this.peers.forEach(peer => callback(peer));
  }

  createNewPeerAndAddPeers(connectedClientSocketID: string): Peer {
    if (this.peers.has(connectedClientSocketID)) {
      console.error('create already exists peer');
    }

    const audio = document.createElement('audio') as HTMLAudioElement;
    audio.autoplay = true;
    this.audioContainer.appendChild(audio);

    const nicknameDiv = document.createElement('div') as HTMLDivElement;
    nicknameDiv.className = 'canvasOverlay';
    this.nicknameContainer.appendChild(nicknameDiv);

    const peer = new Peer(
      this.signalingHelper,
      connectedClientSocketID,
      this.localStream,
      audio,
      nicknameDiv,
      this.connectionClosedDisconnectedFailedCallBack,
      this.pcConfig,
      500,
    );
    this.peers.set(connectedClientSocketID, peer);
    return peer;
  }

  setSignalingEvent(): void {
    this.signalingHelper.onOffer = (offerDto: OfferAnswerDto): void => {
      if (!this.peers.has(offerDto.fromClientId))
        this.createNewPeerAndAddPeers(offerDto.fromClientId);
      const offeredPeer = this.peers.get(offerDto.fromClientId);
      if (offeredPeer) {
        offeredPeer
          .setRemoteDescription(offerDto.sdp)
          .then(() => {
            return offeredPeer.createAnswer();
          })
          .then(sdp => {
            offeredPeer.setLocalDescription(sdp);
            const answerDto: OfferAnswerDto = {
              fromClientId: offeredPeer.socketID,
              toClientId: offeredPeer.connectedClientSocketID,
              sdp: sdp,
            };
            this.signalingHelper.emitAnswer(answerDto);
          })
          .catch(error => {
            console.error(
              `Peer SocketId: ${
                offeredPeer.connectedClientSocketID
              } offer answer fail => ${error.toString()}`,
            );
          });
      }
    };

    this.signalingHelper.onNeedToOffer = (toSocketIDs: string[]): void => {
      toSocketIDs.forEach(connectedSocketId => {
        if (connectedSocketId !== this.signalingHelper.getSocketID()) {
          const newPeer = this.createNewPeerAndAddPeers(connectedSocketId);
          newPeer
            .createOffer()
            .then(sdp => {
              newPeer.setLocalDescription(sdp);
              const offerDto: OfferAnswerDto = {
                toClientId: newPeer.connectedClientSocketID,
                fromClientId: newPeer.socketID,
                sdp: sdp,
              };
              this.signalingHelper.emitOffer(offerDto);
            })
            .catch(error => {
              console.error(
                `Peer SocketId: ${
                  newPeer.connectedClientSocketID
                } createAnswer fail=> ${error.toString()}`,
              );
            });
        }
      });
    };

    this.signalingHelper.onAnswer = (ansDto: OfferAnswerDto): void => {
      console.log(`receive answer from ${ansDto.fromClientId}`);
      const answeredPeer = this.peers.get(ansDto.fromClientId);
      if (answeredPeer) {
        answeredPeer.setRemoteDescription(ansDto.sdp);
      }
    };

    this.signalingHelper.onIce = (iceDto: IceDto): void => {
      const icedPeer = this.peers.get(iceDto.fromClientId);
      if (icedPeer) {
        const ice = new RTCIceCandidate(iceDto.ice);
        icedPeer.addIceCandidate(ice).catch(error => {
          console.error(`addIceCandidate Fail : ${error.toString()}`);
        });
      }
    };
  }

  close(): void {
    console.log('peerManager close called');
    this.peers.forEach(peer => {
      peer.close();
    });
    this.signalingHelper.close();
  }
}
