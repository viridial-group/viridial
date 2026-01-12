import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import type { LoggerOptions } from 'typeorm';
import { join } from 'path';
import { PropertyController } from './controllers/property.controller';
import { CustomFieldController } from './controllers/custom-field.controller';
import { PropertyService } from './services/property.service';
import { GeolocationClientService } from './services/geolocation-client.service';
import { SearchIndexService } from './services/search-index.service';
import { AuthModule } from './auth/auth.module';
import { Property } from './entities/property.entity';
import { PropertyTranslation } from './entities/property-translation.entity';
import { PropertyFlag } from './entities/property-flag.entity';
import { ImportJob } from './entities/import-job.entity';
import { PropertyDetails } from './entities/property-details.entity';
import { CustomFieldDefinition } from './entities/custom-field-definition.entity';
import { CustomFieldValue } from './entities/custom-field-value.entity';
import { Neighborhood } from './entities/neighborhood.entity';
import { NeighborhoodController } from './controllers/neighborhood.controller';
import { NeighborhoodService } from './services/neighborhood.service';
import { ImportService } from './services/import.service';
import { SchemaOrgService } from './services/schema-org.service';
import { PropertyValidationService } from './services/property-validation.service';
import { CustomFieldService } from './services/custom-field.service';
import { PropertyStatisticsService } from './services/property-statistics.service';
import { PropertyFavoriteService } from './services/property-favorite.service';
import { PropertyFavoriteController } from './controllers/property-favorite.controller';
import { PropertyFavorite } from './entities/property-favorite.entity';

// Helper pour parser DATABASE_URL
function parseDatabaseUrl(url?: string) {
  if (!url) {
    throw new Error('DATABASE_URL is required');
  }

  try {
    const parsed = new URL(url);
    return {
      type: 'postgres' as const,
      host: parsed.hostname,
      port: parseInt(parsed.port, 10) || 5432,
      username: parsed.username,
      password: parsed.password,
      database: parsed.pathname.slice(1), // remove leading '/'
      autoLoadEntities: true,
      synchronize: false, // OK pour dev; à désactiver en prod avec migrations
      // Enable SQL query logging (excludes schema operations like CREATE/ALTER TABLE)
      // Set DB_LOGGING=true in your .env file to see SQL queries
      // Logs: SELECT, INSERT, UPDATE, DELETE queries only (no CREATE/ALTER TABLE)
      logging: (process.env.DB_LOGGING === 'true' 
        ? (process.env.DB_LOG_LEVEL === 'all' 
          ? ['query', 'error', 'warn', 'info', 'log'] // 'all' but without 'schema'
          : ['query', 'error'])
        : false) as LoggerOptions,
      logger: (process.env.DB_LOGGING === 'true' ? 'advanced-console' : undefined) as 'advanced-console' | undefined, // Shows formatted SQL queries
    };
  } catch (error) {
    throw new Error(`Invalid DATABASE_URL: ${error}`);
  }
}

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
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL') || process.env.DATABASE_URL;
        return parseDatabaseUrl(databaseUrl);
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Property, PropertyTranslation, PropertyFlag, ImportJob, PropertyDetails, CustomFieldDefinition, CustomFieldValue, Neighborhood, PropertyFavorite]),
    AuthModule, // Import AuthModule for JWT authentication
  ],
  controllers: [PropertyController, NeighborhoodController, CustomFieldController, PropertyFavoriteController],
  providers: [PropertyService, GeolocationClientService, SearchIndexService, NeighborhoodService, ImportService, SchemaOrgService, PropertyValidationService, CustomFieldService, PropertyStatisticsService, PropertyFavoriteService],
})
export class AppModule {}

