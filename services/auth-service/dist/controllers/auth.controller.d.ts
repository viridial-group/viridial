import { AuthService } from '../services/auth.service';
import { OidcService } from '../services/oidc.service';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
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
    refresh(body: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
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
