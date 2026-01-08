import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SearchController } from './controllers/search.controller';
import { SearchService } from './services/search.service';
import { MeilisearchService } from './services/meilisearch.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [SearchController],
  providers: [SearchService, MeilisearchService],
  exports: [SearchService, MeilisearchService], // Export for use in other modules (e.g., Property Service for indexing)
})
export class AppModule {}

