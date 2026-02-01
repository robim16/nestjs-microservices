import { NestFactory } from '@nestjs/core';
import { MediaModule } from './media.module';
import { Logger } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  process.title = 'media'

  const logger = new Logger('MediaBootstrap')
  const port = Number(process.env.MEDIA_TCP_PORT ?? 4012);

  const app = await NestFactory.createMicroservice(
    MediaModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port,
      },
    },
  );

  app.enableShutdownHooks()

  await app.listen();
  
  logger.log(`Media microservice is running on TCP port: ${port}`);
}
bootstrap();
