import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { User } from './entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        autoLoadEntities: true,
        synchronize: true, // OK pour dev; à désactiver en prod avec migrations
      }),
    }),
    TypeOrmModule.forFeature([User]),
    JwtModule.register({}), // secrets & expiresIn gérés dans AuthService via options
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AppModule {}

