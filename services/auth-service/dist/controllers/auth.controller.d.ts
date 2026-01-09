import { AuthService } from '../services/auth.service';
import { OidcService } from '../services/oidc.service';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { SignupDto } from '../dto/signup.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
export declare class AuthController {
    private readonly authService;
    private readonly oidcService;
    constructor(authService: AuthService, oidcService: OidcService);
    health(): {
        status: string;
        service: string;
    };
    login(body: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    signup(body: SignupDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            email: any;
            role: any;
            emailVerified: any;
        };
        message: string;
    }>;
    refresh(body: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    forgotPassword(body: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(body: ResetPasswordDto): Promise<{
        message: string;
    }>;
    verifyEmail(body: VerifyEmailDto): Promise<{
        message: string;
        user: {
            id: any;
            email: any;
            emailVerified: boolean;
        };
    }>;
    resendVerification(body: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    googleAuth(): Promise<void>;
    googleAuthCallback(req: any): Promise<{
        accessToken: string;
        refreshToken: string;
        success: boolean;
        message: string;
        user: {
            id: any;
            email: any;
            role: any;
        };
    }>;
}
