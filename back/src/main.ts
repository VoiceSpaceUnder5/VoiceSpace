import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
async function bootstrap() {
  //   const httpsOptions = {
  //     key: fs.readFileSync('./secrets/private.key'),
  //     cert: fs.readFileSync('./secrets/certificate.crt'),
  //   };

  //const app = await NestFactory.create(AppModule, { httpsOptions }); // service
  const app = await NestFactory.create(AppModule); // dev

  await app.listen(8080);
}
bootstrap();
