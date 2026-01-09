import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { SearchController } from './controllers/search.controller';
import { SearchService } from './services/search.service';
import { MeilisearchService } from './services/meilisearch.service';
import { ClusteringService } from './services/clustering.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(__dirname, '..', '.env.local'), // .env.local pour développement local
        join(__dirname, '..', '.env'), // .env dans le répertoire du service
        join(__dirname, '..', '..', '..', '.env'), // .env à la racine du projet
        join(__dirname, '..', '..', '..', 'infrastructure', 'docker-compose', '.env'), // .env docker-compose
      ],
      expandVariables: true,
    }),
  ],
  controllers: [SearchController],
  providers: [SearchService, MeilisearchService, ClusteringService],
  exports: [SearchService, MeilisearchService], // Export for use in other modules (e.g., Property Service for indexing)
})
export class AppModule {}

