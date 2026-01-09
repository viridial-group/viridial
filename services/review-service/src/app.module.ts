import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewController } from './controllers/review.controller';
import { ReviewService } from './services/review.service';
import { ReviewVoteService } from './services/review-vote.service';
import { ReviewResponseService } from './services/review-response.service';
import { AuthModule } from './auth/auth.module';
import { Review } from './entities/review.entity';
import { ReviewPhoto } from './entities/review-photo.entity';
import { ReviewVote } from './entities/review-vote.entity';
import { ReviewResponseEntity } from './entities/review-response.entity';

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
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => parseDatabaseUrl(process.env.DATABASE_URL),
    }),
    TypeOrmModule.forFeature([Review, ReviewPhoto, ReviewVote, ReviewResponseEntity]),
    AuthModule, // Import AuthModule for JWT authentication
  ],
  controllers: [ReviewController],
  providers: [ReviewService, ReviewVoteService, ReviewResponseService],
})
export class AppModule {}

