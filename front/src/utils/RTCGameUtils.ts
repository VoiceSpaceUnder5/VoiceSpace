import {Socket} from 'socket.io-client';
import GLHelper from './webGLUtils';
import {AvatarImageEnum, AvatarPartImageEnum} from './ImageMetaData';
import {iceConfig} from './IceServerList';
import {IceDto, OfferAnswerDto} from './RTCSignalingHelper';
import ImageInfoProvider from './ImageInfoProvider';

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
    // PlayerDto
    this._nickname = nickname;
    this.nickname = nickname;
    this.avatar = avatar;
    this.avatarFace = AvatarPartImageEnum.FACE_MUTE;
    this.avatarFaceScale = 1;
    this.centerPos = {...centerPos};
    this.rotateRadian = 0;

    //nickname overlay div
    this.nicknameDiv = nicknameDiv;

    // update avatar position values
    this.lastUpdateTimeStamp = Date.now();
    this.velocity = velocity;
    this.normalizedDirectionVector = {x: 0, y: 1};
    this.nextNormalizedDirectionVector = {x: 0, y: 1};
    this.isMoving = false;

    // AudioAnalyser
    this.audioAnalyser = audioAnalyser;

    // this.div = document.createElement('div') as HTMLDivElement;
    // this.div.className = 'canvasOverlay';
    // this.div.innerText = this.nickname;
    // divContainer.appendChild(this.div);
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

export class Peer extends RTCPeerConnection implements IPlayer {
  connectedClientSocketId: string;
  socketId: string;
  dc: RTCDataChannel;
  connectedAudioElement: HTMLAudioElement;
  div: HTMLDivElement;
  maxSoundDistance: number;
  //IPlayer
  nickname: string;
  avatar: AvatarImageEnum;
  avatarFace: AvatarPartImageEnum;
  centerPos: Vec2;
  rotateRadian: number;
  volume: number;
  //
  isDeleted: boolean;

  // volumne multiply value
  volumnMultiplyValue: number;

  constructor(
    connectedClientSocketId: string,
    socketId: string,
    audioContainer: Element,
    divContainer: HTMLDivElement,
    pcConfig?: RTCConfiguration,
  ) {
    super(pcConfig);
    this.connectedClientSocketId = connectedClientSocketId;
    this.socketId = socketId;
    this.isDeleted = false;
    this.maxSoundDistance = 500;
    // div setting
    this.div = document.createElement('div') as HTMLDivElement;
    this.div.className = 'canvasOverlay';
    divContainer.append(this.div);

    //IPlayer
    this.centerPos = {x: 0, y: 0};
    this.nickname = 'Anonymous';
    this.avatar = AvatarImageEnum.BROWN_BEAR;
    this.avatarFace = AvatarPartImageEnum.FACE_MUTE;
    this.rotateRadian = 0;
    this.volume = 0;
    //
    this.volumnMultiplyValue = 1;

    this.dc = this.createDataChannel('dc');
    this.ondatachannel = event => {
      const receviedDC = event.channel;
      receviedDC.onmessage = event => {
        const data = JSON.parse(event.data) as IPlayer;
        this.update(data);
      };
      receviedDC.onopen = () => {
        console.log(`dataChannel created with ${this.connectedClientSocketId}`);
      };
      receviedDC.onclose = () => {
        console.log(`dataChannel closed with ${this.connectedClientSocketId}`);
      };
    };

    // audio setting
    this.connectedAudioElement = document.createElement(
      'audio',
    ) as HTMLAudioElement;
    this.connectedAudioElement.autoplay = true;
    audioContainer.appendChild(this.connectedAudioElement);
    //
  }

  update(data: IPlayer): void {
    this.centerPos = data.centerPos;
    this.nickname = data.nickname;
    this.avatar = data.avatar;
    this.avatarFace = data.avatarFace;
    this.rotateRadian = data.rotateRadian;
    this.volume = data.volume;
    this.div.innerText = data.nickname;
  }

  updateSoundFromVec2(pos: Vec2): void {
    const distance = Math.sqrt(
      Math.pow(this.centerPos.x - pos.x, 2) +
        Math.pow(this.centerPos.y - pos.y, 2),
    );
    const volumeValue = Math.max(0, 1 - distance / this.maxSoundDistance);
    this.connectedAudioElement.volume = volumeValue * this.volumnMultiplyValue;
  }
}

export default class PeerManager {
  peers: Map<string, Peer>;
  socket: Socket;
  localStream: MediaStream;
  pcConfig: RTCConfiguration | undefined;
  me: Me;
  audioContainer: HTMLDivElement;
  divContainer: HTMLDivElement;
  roomId: string;
  constructor(
    socket: Socket,
    localStream: MediaStream,
    nickname: string,
    avatar: AvatarImageEnum,
    audioContainer: HTMLDivElement,
    divContainer: HTMLDivElement,
    meCenterPos: Vec2,
    roomId: string,
    pcConfig?: RTCConfiguration,
  ) {
    this.roomId = roomId;
    this.divContainer = divContainer;
    this.me = new Me(
      nickname,
      avatar,
      meCenterPos,
      0.2,
      localStream,
      divContainer,
    );
    this.localStream = localStream;
    this.socket = socket;
    if (pcConfig) this.pcConfig = pcConfig;
    else this.pcConfig = iceConfig;
    this.peers = new Map();
    this.audioContainer = audioContainer;

    socket.on('offer', (offerDto: OfferAnswerDto) => {
      if (!this.peers.has(offerDto.fromClientId)) {
        this.createPeerWithEventSetting(
          offerDto.fromClientId,
          offerDto.toClientId,
        );
      }
      const offeredPeer = this.peers.get(offerDto.fromClientId);
      if (offeredPeer !== undefined) {
        offeredPeer
          .setRemoteDescription(offerDto.sdp)
          .then(() => {
            offeredPeer
              .createAnswer()
              .then(sdp => {
                offeredPeer.setLocalDescription(sdp);
                const answerDto: OfferAnswerDto = {
                  fromClientId: offeredPeer.socketId,
                  toClientId: offeredPeer.connectedClientSocketId,
                  sdp: sdp,
                };
                this.socket.emit('answer', answerDto);
              })
              .catch(error => {
                console.error(
                  `Peer SocketId: ${
                    offeredPeer.connectedClientSocketId
                  } createAnswer fail=> ${error.toString()}`,
                );
              });
          })
          .catch(error => {
            console.error(
              `Peer SocketId: ${
                offeredPeer.connectedClientSocketId
              } setRemoteDescripton fail=> ${error.toString()}`,
            );
          });
      }
    });

    socket.on('needToOffer', (toSocketIds: string[]) => {
      console.log(`needToOfferCalled number of users : ${toSocketIds.length}`);
      toSocketIds.forEach(connectedSocketId => {
        if (connectedSocketId !== this.socket.id) {
          console.log(`my socketId : ${this.socket.id}`);
          const newPeer = this.createPeerWithEventSetting(
            connectedSocketId,
            this.socket.id,
          );
          newPeer
            .createOffer()
            .then(sdp => {
              newPeer.setLocalDescription(sdp);
              const offerDto: OfferAnswerDto = {
                toClientId: newPeer.connectedClientSocketId,
                fromClientId: newPeer.socketId,
                sdp: sdp,
              };
              this.socket.emit('offer', offerDto);
            })
            .catch(error => {
              console.error(
                `Peer SocketId: ${
                  newPeer.connectedClientSocketId
                } createAnswer fail=> ${error.toString()}`,
              );
            });
        }
      });
    });

    this.socket.on('answer', (answerDto: OfferAnswerDto) => {
      console.log(`receive answer from ${answerDto.fromClientId}`);
      const answeredPeer = this.peers.get(answerDto.fromClientId);
      if (answeredPeer) {
        answeredPeer.setRemoteDescription(answerDto.sdp);
      }
    });

    this.socket.on('ice', (iceDto: IceDto) => {
      const icedPeer = this.peers.get(iceDto.fromClientId);
      if (icedPeer) {
        const ice = new RTCIceCandidate(iceDto.ice);
        icedPeer
          .addIceCandidate(ice)
          .then(() => {
            console.log(
              `set ice success from ${iceDto.fromClientId} type: ${ice.type}`,
            );
            if (ice.type === 'relay') console.log(ice);
          })
          .catch(error => {
            console.error(`addIceCandidate Fail : ${error.toString()}`);
          });
      }
    });
    socket.emit('joinRoom', roomId || 'honleeExample');
  }
  createPeerWithEventSetting(
    connectedClientSocketId: string,
    socketId: string,
  ): Peer {
    const newPeer = new Peer(
      connectedClientSocketId,
      socketId,
      this.audioContainer,
      this.divContainer,
      this.pcConfig,
    );

    this.localStream.getTracks().forEach(track => {
      newPeer.addTrack(track, this.localStream);
    });

    this.peers.set(connectedClientSocketId, newPeer);

    newPeer.addEventListener('icecandidate', event => {
      const iceCandidate = event.candidate;
      if (iceCandidate) {
        const iceDto: IceDto = {
          toClientId: newPeer.connectedClientSocketId,
          fromClientId: newPeer.socketId,
          ice: iceCandidate,
        };
        this.socket.emit('ice', iceDto);
        if (iceCandidate.type === 'relay') {
          console.log(
            `send relay iceCandidate to ${iceDto.toClientId}`,
            iceCandidate,
          );
        } else {
          console.log(
            `send iceCandidate to ${iceDto.toClientId} , type:${iceCandidate.type}`,
          );
        }
      }
    });
    newPeer.addEventListener('track', event => {
      newPeer.connectedAudioElement.srcObject = event.streams[0];
    });
    newPeer.addEventListener('connectionstatechange', event => {
      const targetPeer = event.target as Peer;
      if (
        targetPeer.connectionState === 'closed' ||
        targetPeer.connectionState === 'disconnected' ||
        targetPeer.connectionState === 'failed'
      ) {
        this.peers.delete(targetPeer.connectedClientSocketId);
        if (!targetPeer.isDeleted) {
          this.divContainer.removeChild(targetPeer.div);
          this.audioContainer.removeChild(targetPeer.connectedAudioElement);
          targetPeer.isDeleted = true;
        }
      }
      console.log(
        `connectionState with ${targetPeer.connectedClientSocketId} is ${targetPeer.connectionState}`,
      );
    });
    return newPeer;
  }
  close(): void {
    console.log('peerManager close called');
    this.peers.forEach(peer => {
      peer.close();
    });
    this.socket.close();
  }
}
