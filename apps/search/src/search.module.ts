import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { ConfigModule } from '@nestjs/config';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { SearchProduct, SearchProductSchema } from './search/search-index-schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    MongooseModule.forRoot(process.env.MONGO_URI_SEARCH as string),
    MongooseModule.forFeature([
      {
        name: SearchProduct.name,
        schema: SearchProductSchema,
      },
    ]),
  ],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
