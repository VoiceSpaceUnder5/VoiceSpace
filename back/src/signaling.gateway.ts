import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

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

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class SignalingGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ) {
    client.join(roomId);
    console.log(`${client.id} join room : ${roomId}`);
    const clientIdsInRoom = this.server.sockets.adapter.rooms.get(roomId);
    if (clientIdsInRoom.size > 1) {
      client.emit('needToOffer', Array.from(clientIdsInRoom));
    }
  }

  @SubscribeMessage('offer')
  handleOffer(@MessageBody() offerDto: OfferAnswerDto) {
    const clientSocket = this.server.sockets.sockets.get(offerDto.toClientId);
    if (clientSocket) {
      console.log(
        `from ${offerDto.fromClientId} to ${offerDto.toClientId} offer send`,
      );
      clientSocket.emit('offer', offerDto);
    }
  }

  @SubscribeMessage('answer')
  handleAnswer(@MessageBody() answerDto: OfferAnswerDto) {
    const clientSocket = this.server.sockets.sockets.get(answerDto.toClientId);
    if (clientSocket) {
      console.log(
        `from ${answerDto.fromClientId} to ${answerDto.toClientId} answer send`,
      );
      clientSocket.emit('answer', answerDto);
    }
  }

  @SubscribeMessage('ice')
  handleIce(@MessageBody() iceDto: IceDto) {
    const clientSocket = this.server.sockets.sockets.get(iceDto.toClientId);
    if (clientSocket) {
      console.log(
        `from ${iceDto.fromClientId} to ${iceDto.toClientId} ice send`,
      );
      clientSocket.emit('ice', iceDto);
    }
  }

  afterInit() {
    console.log('Gateway init!');
  }

  handleConnection(@ConnectedSocket() client: Socket) {
    console.log(`client connected ${client.id}`);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log(`client disconnected ${client.id}`);
  }
}
