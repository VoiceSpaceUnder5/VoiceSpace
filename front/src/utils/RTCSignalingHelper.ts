import {Socket} from 'socket.io-client';

/**
 * signaling 의 offer 와 answer 에서 교환되는 데이터 전송객체
 * @param fromClientId offer 나 answer 를 보내는 socketID
 * @param toClientId offer 나 answer 를 받는 socketID
 * @param sdp createOffer 나 createAnswer 로 만들어진 RTCSessionDescriptionInit
 */
export interface OfferAnswerDto {
  fromClientId: string;
  toClientId: string;
  sdp: RTCSessionDescriptionInit;
}

/**
 * signaling 의 iceCandidate 과정에서 교환되는 데이터 전송객체
 * @param fromClientId offer 나 answer 를 보내는 socketID
 * @param toClientId offer 나 answer 를 받는 socketID
 * @param ice onIceCadidate 로 만들어진 RTCIceCandidate
 */
export interface IceDto {
  fromClientId: string;
  toClientId: string;
  ice: RTCIceCandidate;
}

/**
 * RTCPeerConnection 객체의 signaling 에 사용되는 소켓연결을 책임지는 클레스
 * on 이벤트 : offer, answer, ice, needToOffer(socketIds: string)
 * emit 이벤트 : offer, answer, ice, joinRoom(roomId:string)
 * @param socket backend 에 연결되어있는 socket.io
 * @param isVerbose true 일 경우 log 를 출력함.
 */
class RTCSignalingHelper {
  readonly socket: Socket;
  readonly isVerbose: boolean;

  onOffer: (offerDto: OfferAnswerDto) => void;
  onAnswer: (answerDto: OfferAnswerDto) => void;
  onIce: (iceDto: IceDto) => void;
  onNeedToOffer: (socketIDs: string[]) => void;

  private print(log: string, isError = false): void {
    if (this.isVerbose) {
      if (isError) {
        console.error(log);
      } else {
        console.log(log);
      }
    }
  }

  constructor(socket: Socket, isVerbose = true) {
    this.socket = socket;
    this.isVerbose = isVerbose;
    this.onOffer = () => {
      this.print('default onOffer called');
    };
    this.onAnswer = () => {
      this.print('default onAnswer called');
    };
    this.onIce = () => {
      this.print('default onIce called');
    };
    this.onNeedToOffer = () => {
      this.print('default onNeedToOffer called');
    };

    // connect event
    socket.on('offer', (offerDto: OfferAnswerDto) => {
      this.print(`${offerDto.fromClientId} --offer--> ${offerDto.toClientId}`);
      this.onOffer(offerDto);
    });
    socket.on('answer', (ansDto: OfferAnswerDto) => {
      this.print(`${ansDto.fromClientId} --answer--> ${ansDto.toClientId}`);
      this.onAnswer(ansDto);
    });
    socket.on('ice', (iceDto: IceDto) => {
      this.print(`${iceDto.fromClientId} --ice--> ${iceDto.toClientId}`);
      this.onIce(iceDto);
    });
    socket.on('needToOffer', (socketIDs: string[]) => {
      this.print(`you need to offer to ${socketIDs.length - 1} clients`); // 자신이 먼저 조인되고 socketIDs 를 보내기 떄문에 자신이 포함되어있다.
      this.onNeedToOffer(socketIDs);
    });
  }
  emitOffer(offerDto: OfferAnswerDto): void {
    if (offerDto.fromClientId !== this.socket.id) {
      this.print('emitOffer fromClientId is invalid', true);
      return;
    }
    this.print(`${offerDto.fromClientId} --offer--> ${offerDto.toClientId}`);
    this.socket.emit('offer', offerDto);
  }
  emitAnswer(ansDto: OfferAnswerDto): void {
    if (ansDto.fromClientId !== this.socket.id) {
      this.print('emitAnswer fromClientId is invalid', true);
      return;
    }
    this.print(`${ansDto.fromClientId} --answer--> ${ansDto.toClientId}`);
    this.socket.emit('answer', ansDto);
  }
  emitIce(iceDto: IceDto): void {
    if (iceDto.fromClientId !== this.socket.id) {
      this.print('ice fromClientId is invalid', true);
      return;
    }
    this.print(`${iceDto.fromClientId} --ice--> ${iceDto.toClientId}`);
    this.socket.emit('ice', iceDto);
  }
  joinRoom(roomID: string): void {
    if (roomID === '') {
      this.print('roomID can not be ""', true);
      return;
    }
    this.print(`joinRoom! roomID: ${roomID}, my socketId: ${this.socket.id}`);
    this.socket.emit('joinRoom', roomID);
  }
  close(): void {
    this.socket.close();
  }
  getClientID(): string {
    return this.socket.id;
  }
}

export default RTCSignalingHelper;
