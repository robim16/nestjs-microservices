import { NestFactory } from '@nestjs/core';
import { SearchModule } from './search.module';
import { Logger } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  process.title = 'search'

  const logger = new Logger('SearchBootstrap')

  const rmqUrl = process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'

  const queue = process.env.SEARCH_QUEUE ?? 'search_queue'

  const app = await NestFactory.createMicroservice(SearchModule, {
    transport: Transport.RMQ,
    options: {
      urls: [rmqUrl],
      queue,
      queueOptions: {
        durable: false
      }
    },
  });

  app.enableShutdownHooks()

  await app.listen();

  logger.log(`Search RMQ listening on queue ${queue} via ${rmqUrl}`);
}
bootstrap();
