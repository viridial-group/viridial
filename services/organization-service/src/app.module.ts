import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { join } from 'path';
import { OrganizationController } from './controllers/organization.controller';
import { RoleController } from './controllers/role.controller';
import { UserController } from './controllers/user.controller';
import { PermissionController } from './controllers/permission.controller';
import { AuthController } from './controllers/auth.controller';
import { PlanController } from './controllers/plan.controller';
import { SubscriptionController } from './controllers/subscription.controller';
import { BoosterPackController } from './controllers/booster-pack.controller';
import { OrganizationService } from './services/organization.service';
import { RoleService } from './services/role.service';
import { PermissionService } from './services/permission.service';
import { ResourceService } from './services/resource.service';
import { FeatureService } from './services/feature.service';
import { UserService } from './services/user.service';
import { AuthService } from './services/auth.service';
import { EmailService } from './services/email.service';
import { PlanService } from './services/plan.service';
import { SubscriptionService } from './services/subscription.service';
import { BoosterPackService } from './services/booster-pack.service';
import { Organization } from './entities/organization.entity';
import { OrganizationAddress } from './entities/organization-address.entity';
import { OrganizationPhone } from './entities/organization-phone.entity';
import { OrganizationEmail } from './entities/organization-email.entity';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { Resource } from './entities/resource.entity';
import { Feature } from './entities/feature.entity';
import { UserRole } from './entities/user-role.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { EmailVerificationToken } from './entities/email-verification-token.entity';
import { Plan } from './entities/plan.entity';
import { PlanFeature } from './entities/plan-feature.entity';
import { PlanLimit } from './entities/plan-limit.entity';
import { Subscription } from './entities/subscription.entity';
import { UserPlan } from './entities/user-plan.entity';
import { BoosterPack } from './entities/booster-pack.entity';

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
      synchronize: false, // Disabled: Use migrations instead of automatic schema synchronization
      logging: process.env.NODE_ENV !== 'production' ? ['query', 'error'] : ['error'], // Log SQL queries in development
    };
  } catch (error) {
    throw new Error(`Invalid DATABASE_URL: ${error}`);
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(__dirname, '..', '.env.local'), // .env.local pour développement local
        join(__dirname, '..', '.env'), // .env dans le répertoire du service
        join(__dirname, '..', '..', '..', '.env'), // .env à la racine du projet
        join(__dirname, '..', '..', '..', 'infrastructure', 'docker-compose', '.env'), // .env docker-compose
      ],
      expandVariables: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL') || process.env.DATABASE_URL;
        return parseDatabaseUrl(databaseUrl);
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      Organization,
      OrganizationAddress,
      OrganizationPhone,
      OrganizationEmail,
      User,
      Role,
      Permission,
      Resource,
      Feature,
      UserRole,
      PasswordResetToken,
      EmailVerificationToken,
      Plan,
      PlanFeature,
      PlanLimit,
      Subscription,
      UserPlan,
      BoosterPack,
    ]),
    PassportModule,
    JwtModule.register({}), // secrets & expiresIn gérés dans AuthService via options
  ],
  controllers: [
    OrganizationController,
    RoleController,
    UserController,
    PermissionController,
    AuthController,
    PlanController,
    SubscriptionController,
    BoosterPackController,
  ],
  providers: [
    OrganizationService,
    RoleService,
    PermissionService,
    ResourceService,
    FeatureService,
    UserService,
    AuthService,
    EmailService,
    PlanService,
    SubscriptionService,
    BoosterPackService,
  ],
  exports: [
    OrganizationService,
    RoleService,
    PermissionService,
    ResourceService,
    FeatureService,
    UserService,
    AuthService,
    PlanService,
    SubscriptionService,
    BoosterPackService,
  ],
})
export class AppModule {}

