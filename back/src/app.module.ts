import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SignalingGateway } from './signaling.gateway';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, SignalingGateway],
})
export class AppModule {}
