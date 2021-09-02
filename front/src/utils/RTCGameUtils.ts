import {Socket} from 'socket.io-client';
import GLHelper from './webGLUtils';
import {AvatarImageEnum, AvatarPartImageEnum} from './ImageMetaData';
import {iceConfig} from './IceServerList';

export interface Vec2 {
  x: number;
  y: number;
}

export interface IPlayer {
  nickname: string;
  avatar: AvatarImageEnum;
  avatarFace: AvatarPartImageEnum;
  centerPos: Vec2;
  rotateRadian: number;
  volume: number;
}

class Me implements IPlayer {
  // IPlayer
  nickname: string;
  avatar: AvatarImageEnum;
  avatarFace: AvatarPartImageEnum;
  centerPos: Vec2;
  rotateRadian: number;
  volume: number;
  //
  lastUpdateTimeStamp: number;
  div: HTMLDivElement;
  velocity: number;
  normalizedDirectionVector: Vec2;
  nextNormalizedDirectionVector: Vec2;
  isMoving: boolean;

  analyser: AnalyserNode;
  // value
  SpeakThrashHold: number;
  SpeakMouseThrashHold: number;
  //
  constructor(
    nickname: string,
    avatar: AvatarImageEnum,
    centerPos: Vec2,
    velocity: number,
    stream: MediaStream,
    divContainer: HTMLDivElement,
  ) {
    this.nickname = nickname;
    this.avatar = avatar;
    this.avatarFace = AvatarPartImageEnum.FACE_MUTE;
    this.centerPos = centerPos;
    this.velocity = velocity;
    this.normalizedDirectionVector = {x: 0, y: 1};
    this.nextNormalizedDirectionVector = {x: 0, y: 1};
    this.rotateRadian = 0;
    this.volume = 0;
    this.isMoving = false;
    this.lastUpdateTimeStamp = Date.now();

    this.SpeakThrashHold = 30;
    this.SpeakMouseThrashHold = 50;

    this.div = document.createElement('div') as HTMLDivElement;
    this.div.className = 'canvasOverlay';
    this.div.innerText = this.nickname;
    divContainer.appendChild(this.div);

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    this.analyser = audioContext.createAnalyser();
    this.analyser.smoothingTimeConstant = 0.4;
    this.analyser.fftSize = 1024;
    source.connect(this.analyser);
  }

  getIPlayer(): IPlayer {
    const data: IPlayer = {
      nickname: this.nickname,
      avatar: this.avatar,
      avatarFace: this.avatarFace,
      centerPos: this.centerPos,
      rotateRadian: this.rotateRadian,
      volume: this.volume,
    };
    return data;
  }

  isCollision(glHelper: GLHelper): boolean {
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
    this.div.innerText = this.nickname; // update nickname div innerText

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
    // update mic volume
    const array = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(array);
    this.volume =
      array.reduce((acc, cur) => {
        return acc + cur;
      }, 0) / array.length;

    // update avatarFaceEnum by volume
    this.avatarFace = AvatarPartImageEnum.FACE_MUTE;
    if (this.volume > this.SpeakThrashHold)
      this.avatarFace = AvatarPartImageEnum.FACE_SPEAK;
    if (this.volume > this.SpeakMouseThrashHold)
      this.avatarFace = AvatarPartImageEnum.FACE_SPEAK_SMILE;
  }
}

interface OfferAnswerDto {
  fromClientId: string;
  toClientId: string;
  sdp: RTCSessionDescriptionInit;
}

interface IceDto {
  fromClientId: string;
  toClientId: string;
  ice: RTCIceCandidate;
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
    this.dc = this.createDataChannel('dc');
    this.ondatachannel = event => {
      const receviedDC = event.channel;
      receviedDC.onmessage = event => {
        const data = JSON.parse(event.data) as IPlayer;
        this.update(data);
      };
      receviedDC.onopen = () => {
        console.log('dataChannel created');
      };
      receviedDC.onclose = () => {
        console.log('dataChannel closed');
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
    this.rotateRadian = data.rotateRadian;
    this.volume = data.volume;
    this.div.innerText = data.nickname;
  }

  updateSoundFromVec2(pos: Vec2): void {
    const distance = Math.sqrt(
      Math.pow(this.centerPos.x - pos.x, 2) +
        Math.pow(this.centerPos.y - pos.y, 2),
    );
    this.connectedAudioElement.volume = Math.max(
      0,
      1 - distance / this.maxSoundDistance,
    );
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
        offeredPeer.setRemoteDescription(offerDto.sdp);
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
      }
    });

    socket.on('needToOffer', (toSocketIds: string[]) => {
      console.log('needToOfferCalled');
      toSocketIds.forEach(connectedSocketId => {
        if (connectedSocketId !== this.socket.id) {
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
      const answeredPeer = this.peers.get(answerDto.fromClientId);
      if (answeredPeer) {
        answeredPeer.setRemoteDescription(answerDto.sdp);
      }
    });

    this.socket.on('ice', (iceDto: IceDto) => {
      const icedPeer = this.peers.get(iceDto.fromClientId);
      if (icedPeer) {
        icedPeer
          .addIceCandidate(new RTCIceCandidate(iceDto.ice))
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
