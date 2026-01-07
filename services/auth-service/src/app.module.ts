import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';

@Module({
  imports: [
    JwtModule.register({}) // secrets & expiresIn gérés dans AuthService via options
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AppModule {}

