import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../services/auth.service';
import { OidcService } from '../services/oidc.service';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { SignupDto } from '../dto/signup.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly oidcService: OidcService,
  ) {}

  @Get('health')
  health() {
    return { status: 'ok', service: 'auth-service' };
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    const { email, password } = body;
    return this.authService.login(email, password);
  }

  @Post('signup')
  async signup(@Body() body: SignupDto) {
    const { email, password, confirmPassword } = body;
    return this.authService.signup(email, password, confirmPassword);
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

  /**
   * Initie le flow OAuth Google
   * Redirige vers Google pour l'authentification
   */
  @Get('oidc/google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Passport redirige automatiquement vers Google
    // Cette méthode ne sera jamais appelée directement
  }

  /**
   * Callback après authentification Google réussie
   * Google redirige ici avec un code d'autorisation
   */
  @Get('oidc/google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: any) {
    // req.user contient les infos du profil Google (depuis GoogleStrategy.validate)
    const googleProfile = req.user;

    // Trouver ou créer l'utilisateur
    const user = await this.oidcService.findOrCreateUser(googleProfile);

    // Générer les tokens JWT
    const tokens = await this.oidcService.generateTokens(user);

    // En production, on redirigerait vers le frontend avec les tokens
    // Pour le PoC, on retourne les tokens en JSON
    return {
      success: true,
      message: 'Google OAuth authentication successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      ...tokens,
    };
  }
}


