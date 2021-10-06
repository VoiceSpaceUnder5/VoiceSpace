import GLHelper from './webGLUtils';
import {AvatarImageEnum, AvatarPartImageEnum} from './ImageMetaData';
import RTCSignalingHelper, {IceDto, OfferAnswerDto} from './RTCSignalingHelper';
import {Formant} from './ImageMetaData';

/**
 * DataDto 의 type enum
 */
export enum DataDtoType {
  PLAYER_INFO,
  CHAT_MESSAGE,
  SHARED_SCREEN_CLOSE,
  SHARED_SCREEN_CLEAR,
  SHARED_SCREEN_DRAWING,
  SHARED_SCREEN_DRAW_START,
}

/**
 * peerConnection 의 dataChannel 을 통해서 Data 를 전송할때 규약
 */
export interface DataDto {
  type: DataDtoType;
  // eslint-disable-next-line
  data: any;
}

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
  textMessage: string;
  avatar: AvatarImageEnum;
  centerPos: Vec2;
  partRotatedegree: number;
  rotateCounterclockwise: boolean;
  lookLeft: boolean;
}

function getMonvingAverage(period: number) {
  const arr: number[] = [];
  let sum = 0;
  return (value: number) => {
    sum += value;
    arr.push(value);
    if (arr.length >= period) {
      sum -= arr[0];
      arr.shift();
    }
    if (arr.length < period / 2) return 0;
    return sum / arr.length;
  };
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
  private readonly smad: number[];

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
    source.connect(this.analyser);
    this.analyser.smoothingTimeConstant = 0.6;
    this.analyser.fftSize = 2048;
    this.smad = [];

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
    let avatarFace = AvatarPartImageEnum.FACE_MUTE;

    this.analyser.getByteFrequencyData(this.byteFrequencyDataArray);

    // get volume
    const volume =
      this.byteFrequencyDataArray.reduce((acc, cur) => {
        return acc + cur;
      }, 0) / this.byteFrequencyDataArray.length;
    // get avatarFace scale by volume and volumeDivideValue
    const scale = 1 + volume / this.volumeDivideValue;
    const stringFormants = localStorage.getItem('formants');
    if (stringFormants === null) {
      // get avatarFaceEnum by volume
      if (volume > this.speakThrashHold)
        avatarFace = AvatarPartImageEnum.FACE_A;
      if (volume > this.speakMouseThrashHold)
        avatarFace = AvatarPartImageEnum.FACE_A;
      return {
        avatarFace: avatarFace,
        avatarFaceScale: scale,
      };
    } else {
      avatarFace = AvatarPartImageEnum.FACE_MUTE;
      const sma = getMonvingAverage(16);
      this.smad.length = 0;
      this.byteFrequencyDataArray.forEach(value => {
        this.smad.push(sma(value));
      });

      const formants = JSON.parse(stringFormants) as Formant[];
      const candidates = formants.map(value => {
        let vowelsSelfDist = 0;
        const dot = value.array.reduce((acc, cur, idx) => {
          vowelsSelfDist += cur * cur;
          return acc + cur * this.smad[idx];
        }, 0);
        const smadSelfDist = this.smad.reduce((acc, cur) => {
          return acc + cur * cur;
        }, 0);
        const similarity =
          dot / (Math.sqrt(vowelsSelfDist) * Math.sqrt(smadSelfDist));
        return {
          vowel: value.label,
          similarity: similarity,
          image: value.Image,
          distPercent: smadSelfDist / vowelsSelfDist,
        };
      });
      candidates.sort((a, b) => b.similarity - a.similarity);

      if (candidates[0].similarity > 0.9 && candidates[0].distPercent > 0.5) {
        console.log(candidates[0].vowel);
        if (candidates[0].vowel === 'A')
          avatarFace = AvatarPartImageEnum.FACE_A;
        else if (candidates[0].vowel === 'E')
          avatarFace = AvatarPartImageEnum.FACE_E;
        else if (candidates[0].vowel === 'I')
          avatarFace = AvatarPartImageEnum.FACE_I;
        else if (candidates[0].vowel === 'O')
          avatarFace = AvatarPartImageEnum.FACE_O;
        else if (candidates[0].vowel === 'U')
          avatarFace = AvatarPartImageEnum.FACE_U;
      }
      return {
        avatarFace: avatarFace,
        avatarFaceScale: scale,
      };
    }
  }
}

/**
 * 책임 : 자기 avatar 의 모든 정보를 가지고 있고, update 가 호출되면 현재 위치, 방향 등의 정보를 업데이트함
 * 내부적으로 AudioAnalyser 를 가지고 연결된 peer 들에게 전송해야 되는 데이터를 output 함
 */
export class Me implements PlayerDto {
  // PlayerDto
  private _nickname: string; //외부에서 변경하는 것이 아니라, setter 를 통해서 변경. setter 에서는 nickname 이 변경되면 nicknameDiv 의 innerText 도 같이 변경함.
  private _textMessage: string;
  avatar: AvatarImageEnum;
  avatarFace: AvatarPartImageEnum;
  avatarFaceScale: number;
  centerPos: Vec2;
  partRotatedegree: number;
  rotateCounterclockwise: boolean;
  lookLeft: boolean;

  //nickname overlay div
  nicknameDiv: HTMLDivElement;

  //textMessage overlay div
  textMessageDiv: HTMLDivElement;

  // update avatar position values
  private lastUpdateTimeStamp: number;
  private readonly velocity: number;
  private normalizedDirectionVector: Vec2;
  nextNormalizedDirectionVector: Vec2;
  isMoving: boolean;

  // AudioAnalyser
  private audioAnalyser: AudioAnalyser;
  constructor(
    nicknameDiv: HTMLDivElement,
    textMessageDiv: HTMLDivElement,
    audioAnalyser: AudioAnalyser,
    centerPos: Vec2, // original centerPos
    nickname = '익명의 곰', // 추후 .env 로 이동해야 될듯 (하드코딩 제거)
    textMessage: string,
    avatar = AvatarImageEnum.BROWN_BEAR,
    velocity = 0.2,
  ) {
    //nickname overlay div
    this.nicknameDiv = nicknameDiv;

    //textMessage overlay div
    this.textMessageDiv = textMessageDiv;

    // PlayerDto
    this._nickname = nickname;
    this.nickname = nickname;
    this._textMessage = textMessage;
    this.textMessage = textMessage;
    this.avatar = avatar;
    this.avatarFace = AvatarPartImageEnum.FACE_MUTE;
    this.avatarFaceScale = 1;
    this.centerPos = {...centerPos};
    this.partRotatedegree = 0;
    this.rotateCounterclockwise = false;
    this.lookLeft = false;

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

  set textMessage(textMessage: string) {
    this._textMessage = textMessage;
    this.textMessageDiv.innerText = textMessage;
  }

  get textMessage(): string {
    return this._textMessage;
  }

  getPlayerDto(): PlayerDto {
    return {
      nickname: this._nickname,
      textMessage: this._textMessage,
      avatar: this.avatar,
      avatarFace: this.avatarFace,
      avatarFaceScale: this.avatarFaceScale,
      centerPos: {...this.centerPos},
      partRotatedegree: this.partRotatedegree,
      rotateCounterclockwise: this.rotateCounterclockwise,
      lookLeft: this.lookLeft,
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

  setAnalyser(analyser: AudioAnalyser): void {
    this.audioAnalyser = analyser;
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
      const oldpartRotatedegree = this.partRotatedegree;

      // position value update
      this.normalizedDirectionVector = {...this.nextNormalizedDirectionVector};
      this.centerPos.x +=
        this.velocity * this.normalizedDirectionVector.x * millisDiff;
      this.centerPos.y +=
        this.velocity * this.normalizedDirectionVector.y * millisDiff;
      if (this.rotateCounterclockwise === false) {
        this.partRotatedegree += 1.2;
      } else {
        this.partRotatedegree -= 1.2;
      }
      if (this.partRotatedegree > 15) {
        this.rotateCounterclockwise = true;
      } else if (this.partRotatedegree < -15) {
        this.rotateCounterclockwise = false;
      }
      this.lookLeft = this.centerPos.x < oldCenterPosX ? true : false;
      //collision detection part
      if (this.isCollision(glHelper)) {
        // if isCollision -> rollback value
        this.centerPos.x = oldCenterPosX;
        this.centerPos.y = oldCenterPosY;
        this.normalizedDirectionVector.x = oldnormalizedDirectionVectorX;
        this.normalizedDirectionVector.y = oldnormalizedDirectionVectorY;
        this.partRotatedegree = oldpartRotatedegree;
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
  textMessage: string;
  avatar: AvatarImageEnum;
  avatarFace: AvatarPartImageEnum;
  avatarFaceScale: number;
  centerPos: Vec2;
  partRotatedegree: number;
  rotateCounterclockwise: boolean;
  lookLeft: boolean;

  //nickname overlay div
  nicknameDiv: HTMLDivElement;

  // textMessage overlay div
  textMessageDiv: HTMLDivElement;

  //trackEventHandler (ontrack 으로 새로운 트랙이 들어왔을 때)
  trackEventHandler: (peerId: string, event: RTCTrackEvent) => void;

  //dataChannel onMessageEvents container
  // eslint-disable-next-line
  dataChannelEventHandlers: Map<DataDtoType, (data: any, peer: Peer) => void>;
  constructor(
    signalingHelper: RTCSignalingHelper,
    connectedClientSocketID: string,
    localStream: MediaStream,
    audio: HTMLAudioElement,
    nicknameDiv: HTMLDivElement,
    textMessageDiv: HTMLDivElement,
    connectionClosedDisconnectedFailedCallBack: (peer: Peer) => void,
    pcConfig: RTCConfiguration,
    // eslint-disable-next-line
    dataChannelEventHandlers: Map<DataDtoType, (data: any, peer: Peer) => void>,
    trackEventHandler: (peerId: string, event: RTCTrackEvent) => void,
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
    this.textMessage = '';
    this.avatar = AvatarImageEnum.BROWN_BEAR;
    this.avatarFace = AvatarPartImageEnum.FACE_MUTE;
    this.avatarFaceScale = 1;
    this.centerPos = {x: -1000, y: -1000};
    this.partRotatedegree = 0;
    this.rotateCounterclockwise = false;
    this.lookLeft = false;

    //nickname overlay div
    this.nicknameDiv = nicknameDiv;

    //textMessage overlay div
    this.textMessageDiv = textMessageDiv;

    //trackEventHandler
    this.trackEventHandler = trackEventHandler;

    //dataChannel onMessageEvents container
    this.dataChannelEventHandlers = dataChannelEventHandlers;

    //    connect localStream
    localStream.getTracks().forEach(track => {
      this.addTrack(track);
    });

    // event setting
    this.setEvent(signalingHelper, connectionClosedDisconnectedFailedCallBack);
  }

  private getDataChannelEventHandler(
    type: DataDtoType,
    // eslint-disable-next-line
  ): ((data: any, peer: Peer) => void) | undefined {
    return this.dataChannelEventHandlers.get(type);
  }

  private setEvent(
    signalingHelper: RTCSignalingHelper,
    connectionClosedDisconnectedFailedCallBack: (peer: Peer) => void,
  ): void {
    // negotitateneeded
    this.onnegotiationneeded = () => {
      console.log('onnegotiationneeded!!');
    };

    // fire when peer connection is established
    this.ondatachannel = event => {
      const receviedDC = event.channel;
      receviedDC.onmessage = event => {
        const dataDto = JSON.parse(event.data) as DataDto;
        const cb = this.getDataChannelEventHandler(dataDto.type);
        if (cb) cb(dataDto.data, this);
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
      if (!event.streams[0] && event.track.kind === 'audio') {
        const stream = new MediaStream();
        stream.addTrack(event.track);
        this.audio.srcObject = stream;
      } else {
        this.trackEventHandler(this.connectedClientSocketID, event);
      }
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
    this.textMessage = data.textMessage;
    this.avatar = data.avatar;
    this.avatarFace = data.avatarFace;
    this.avatarFaceScale = data.avatarFaceScale;
    this.partRotatedegree = data.partRotatedegree;
    this.nicknameDiv.innerText = data.nickname;
    this.textMessageDiv.innerText = data.textMessage;
    this.lookLeft = data.lookLeft;
  }

  updateSoundFromVec2(pos: Vec2): void {
    const distance = Math.sqrt(
      Math.pow(this.centerPos.x - pos.x, 2) +
        Math.pow(this.centerPos.y - pos.y, 2),
    );
    const volumeValue = Math.max(0, 1 - distance / this.maxSoundDistance);
    this.audio.volume = volumeValue * this.volumnMultiplyValue;
  }

  /**
   *
   * @param data JSON.stringify(dataDto: DataDto)
   */
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
  localStream: MediaStream;
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

  //dataChannel onMessageEvents container
  // eslint-disable-next-line
  dataChannelEventHandlers: Map<DataDtoType, (data: any, peer: Peer) => void>;

  // trackEventHadler
  trackEventHandler: (peerId: string, event: RTCTrackEvent) => void;

  // screenVideoTracks
  screenVideoTracks: MediaStreamTrack[];

  // my socket ID
  readonly socketID: string;

  // speakerDeviceID (for sink)
  speakerDeviceID: string;

  // micDeviceID (stream)
  readonly micDeviceID: string;
  constructor(
    signalingHelper: RTCSignalingHelper,
    localStream: MediaStream,
    audioContainer: HTMLDivElement,
    nicknameContainer: HTMLDivElement,
    pcConfig: RTCConfiguration,
    roomID: string,
    me: Me,
    speakerDeviceID = 'default',
    micDeviceID = 'default',
  ) {
    // create new Peer params
    this.signalingHelper = signalingHelper;
    this.localStream = localStream;
    // this.localStream.getAudioTracks()[0].onended = () => {
    //   console.log('RTCGameUtils에서 오디오 트랙 종료를 잡아보자.');
    // };
    this.audioContainer = audioContainer;
    this.nicknameContainer = nicknameContainer;
    this.connectionClosedDisconnectedFailedCallBack = (peer: Peer): void => {
      if (this.peers.get(peer.connectedClientSocketID)) {
        this.peers.delete(peer.connectedClientSocketID);
        this.audioContainer.removeChild(peer.audio);
        this.nicknameContainer.removeChild(peer.nicknameDiv);
        this.nicknameContainer.removeChild(peer.textMessageDiv);
      }
    };
    this.pcConfig = pcConfig;

    // peer container
    this.peers = new Map<string, Peer>();

    // Me
    this.me = me;

    // roomID
    this.roomID = roomID;

    //dataChannel onMessageEvents container
    this.dataChannelEventHandlers = new Map();

    // trackEventHandler
    this.trackEventHandler = () => {
      return;
    };

    // screenVideoTracks
    this.screenVideoTracks = [];

    // my socket ID
    this.socketID = signalingHelper.getSocketID();

    // speaker Device ID
    this.speakerDeviceID = speakerDeviceID;

    // micDeviceID
    this.micDeviceID = micDeviceID;

    // setEvent
    this.setSignalingEvent();

    // JoinRoom
    this.signalingHelper.joinRoom(roomID);
  }

  changeEachAudio(deviceId: string): void {
    this.speakerDeviceID = deviceId;
    this.forEachPeer((peer: Peer) => {
      // eslint-disable-next-line
      const audio = peer.audio as any;
      audio.setSinkId(deviceId);
      console.log(peer);
    });
  }
  forEachPeer(callback: (peer: Peer) => void): void {
    this.peers.forEach(peer => callback(peer));
  }

  setDataChannelEventHandler(
    type: DataDtoType,
    // eslint-disable-next-line
    handler: (data: any, peer: Peer) => void,
  ): void {
    this.dataChannelEventHandlers.set(type, handler);
  }

  createNewPeerAndAddPeers(connectedClientSocketID: string): Peer {
    if (this.peers.has(connectedClientSocketID)) {
      console.error('create already exists peer');
    }

    const audio = document.createElement('audio') as HTMLAudioElement;
    audio.autoplay = true;
    try {
      // eslint-disable-next-line
      (audio as any).setSinkId(this.speakerDeviceID);
    } catch {
      console.error('speaker deviceID is not valid');
    }
    this.audioContainer.appendChild(audio);

    const nicknameDiv = document.createElement('div') as HTMLDivElement;
    nicknameDiv.className = 'canvasOverlay';
    this.nicknameContainer.appendChild(nicknameDiv);
    const textMessageDiv = document.createElement('div') as HTMLDivElement;
    textMessageDiv.className = 'canvasOverlay';
    this.nicknameContainer.appendChild(textMessageDiv);

    const peer = new Peer(
      this.signalingHelper,
      connectedClientSocketID,
      this.localStream,
      audio,
      nicknameDiv,
      textMessageDiv,
      this.connectionClosedDisconnectedFailedCallBack,
      this.pcConfig,
      this.dataChannelEventHandlers,
      this.trackEventHandler,
      500,
    );
    if (this.screenVideoTracks.length > 0) {
      peer.addEventListener('connectionstatechange', () => {
        if (peer.connectionState === 'connected') {
          const stream = new MediaStream();
          this.screenVideoTracks.forEach(track => {
            try {
              peer.addTrack(track, stream);
            } catch (error) {
              console.error(`screenVideoTracks error!`);
            }
          });
          this.peerOffer(peer);
        }
      });
    }
    this.peers.set(connectedClientSocketID, peer);
    return peer;
  }

  peerOffer(peer: Peer): void {
    peer
      .createOffer()
      .then(sdp => {
        peer.setLocalDescription(sdp);
        const offerDto: OfferAnswerDto = {
          toClientId: peer.connectedClientSocketID,
          fromClientId: peer.socketID,
          sdp: sdp,
        };
        this.signalingHelper.emitOffer(offerDto);
      })
      .catch(error => {
        console.error(
          `Peer SocketId: ${
            peer.connectedClientSocketID
          } createAnswer fail=> ${error.toString()}`,
        );
      });
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
          this.peerOffer(newPeer);
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
    this.peers.forEach(peer => {
      const data: DataDto = {
        type: DataDtoType.SHARED_SCREEN_CLOSE,
        data: peer.socketID,
      };
      peer.transmitUsingDataChannel(JSON.stringify(data));
      peer.close();
    });
    this.signalingHelper.close();
  }
}
