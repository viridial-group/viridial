import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { join } from 'path';
import type { RedisStore } from 'cache-manager-redis-store';
import redisStore from 'cache-manager-redis-store';
import { GeolocationController } from './controllers/geolocation.controller';
import { GeolocationService } from './services/geolocation.service';
import { PropertyClientService } from './services/property-client.service';
import { GoogleProviderService } from './providers/google-provider.service';
import { NominatimProviderService } from './providers/nominatim-provider.service';
import { StubProviderService } from './providers/stub-provider.service';

// Helper to parse REDIS_URL
function parseRedisUrl(url?: string) {
  if (!url) {
    return null; // Cache disabled if no Redis URL
  }

  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port, 10) || 6379,
      password: parsed.password || undefined,
    };
  } catch (error) {
    console.warn('Invalid REDIS_URL, caching disabled:', error);
    return null;
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
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisConfig = parseRedisUrl(configService.get<string>('REDIS_URL'));

        if (!redisConfig) {
          // Fallback to in-memory cache if Redis not available
          return {
            ttl: 86400 * 1000, // 24 hours
            max: 1000, // Max 1000 items
          };
        }

        return {
          store: redisStore as any,
          host: redisConfig.host,
          port: redisConfig.port,
          password: redisConfig.password,
          ttl: 86400, // 24 hours default TTL (in seconds for Redis)
          max: 0, // Not used by Redis store, but required by type
        };
      },
    }),
  ],
  controllers: [GeolocationController],
  providers: [
    GeolocationService,
    PropertyClientService,
    GoogleProviderService,
    NominatimProviderService,
    StubProviderService,
  ],
})
export class AppModule {}

