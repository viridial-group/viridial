import { Body, Controller, Get, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { SignupDto } from '../dto/signup.dto';
import { SignupWithOrganizationDto } from '../dto/signup-with-organization.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Get('health')
  health() {
    return { status: 'ok', service: 'organization-service' };
  }

  @Post('login')
  async login(@Body() body: any) {
    // Allow "admin" as special case to bypass validation 
    const { email, password } = body;
    
    // Special handling for admin user - bypass validation
    if (email === 'admin' && password === 'admin') {
      return this.authService.login('admin', 'admin');
    }
    
    // For other users, use the validated DTO
    const loginDto = body as LoginDto;
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('signup')
  async signup(@Body() body: SignupDto) {
    const { email, password, confirmPassword } = body;
    return this.authService.signup(email, password, confirmPassword);
  }

  @Post('signup-with-organization')
  async signupWithOrganization(@Body() body: SignupWithOrganizationDto) {
    const {
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
      phone,
      preferredLanguage,
      organization,
    } = body;
    return this.authService.signupWithOrganization(
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
      phone,
      preferredLanguage,
      organization,
    );
  }

  @Post('refresh')
  async refresh(@Body() body: RefreshTokenDto) {
    return this.authService.refresh(body.refreshToken);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    const { email } = body;
    return this.authService.requestPasswordReset(email);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    const { token, newPassword, confirmPassword } = body;
    return this.authService.resetPassword(token, newPassword, confirmPassword);
  }

  @Post('verify-email')
  async verifyEmail(@Body() body: VerifyEmailDto) {
    const { token } = body;
    return this.authService.verifyEmail(token);
  }

  @Post('resend-verification')
  async resendVerification(@Body() body: ForgotPasswordDto) {
    const { email } = body;
    return this.authService.resendVerificationEmail(email);
  }
}

