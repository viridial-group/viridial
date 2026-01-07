import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyController } from './controllers/property.controller';
import { PropertyService } from './services/property.service';
import { Property } from './entities/property.entity';
import { PropertyTranslation } from './entities/property-translation.entity';

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
      synchronize: process.env.NODE_ENV !== 'production', // OK pour dev; à désactiver en prod avec migrations
    };
  } catch (error) {
    throw new Error(`Invalid DATABASE_URL: ${error}`);
  }
}

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => parseDatabaseUrl(process.env.DATABASE_URL),
    }),
    TypeOrmModule.forFeature([Property, PropertyTranslation]),
  ],
  controllers: [PropertyController],
  providers: [PropertyService],
})
export class AppModule {}

