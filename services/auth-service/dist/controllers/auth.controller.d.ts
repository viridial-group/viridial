import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
}
