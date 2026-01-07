"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const typeorm_1 = require("@nestjs/typeorm");
const auth_controller_1 = require("./controllers/auth.controller");
const auth_service_1 = require("./services/auth.service");
const oidc_service_1 = require("./services/oidc.service");
const google_strategy_1 = require("./strategies/google.strategy");
const user_entity_1 = require("./entities/user.entity");
function parseDatabaseUrl(url) {
    if (!url) {
        throw new Error('DATABASE_URL is required');
    }
    try {
        const parsed = new URL(url);
        return {
            type: 'postgres',
            host: parsed.hostname,
            port: parseInt(parsed.port, 10) || 5432,
            username: parsed.username,
            password: parsed.password,
            database: parsed.pathname.slice(1),
            autoLoadEntities: true,
            synchronize: process.env.NODE_ENV !== 'production',
        };
    }
    catch (error) {
        throw new Error(`Invalid DATABASE_URL: ${error}`);
    }
}
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRootAsync({
                useFactory: () => parseDatabaseUrl(process.env.DATABASE_URL),
            }),
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User]),
            passport_1.PassportModule,
            jwt_1.JwtModule.register({}),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [auth_service_1.AuthService, oidc_service_1.OidcService, google_strategy_1.GoogleStrategy],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map