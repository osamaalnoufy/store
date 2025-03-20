import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from '../Controllers/Auth/auth.controller';
import { AuthService } from '../Services/Auth/auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/entities/users.entity';
import { Tokens } from 'src/entities/tokens.entity';
import { MailService } from 'src/mailer/mailer.service';
import { JwtStrategy } from '../strategies/jwt-strategy';
import { LocalUserStrategy } from '../strategies/local-user-strategy';
import { ResetToken } from 'src/entities/resetToken.entity';
import { ForgotPassword } from '../Controllers/Auth/ResetPassword/forgotPassword.controller';
import { ChangePassword } from '../Controllers/Auth/ResetPassword/changePassword.controller';
import { ResetPassword } from '../Controllers/Auth/ResetPassword/resetPassword.controller';
import { ForgotPasswordService } from '../Services/Auth/ResetPassword/forgotPassword.service';
import { ChangePasswordService } from '../Services/Auth/ResetPassword/changePassword.service';
import { ResetPasswordService } from '../Services/Auth/ResetPassword/resetPassword.service';
import { AdminController } from '../Controllers/Admin/admin.controller';
import { AdminService } from '../Services/Admin/admin.service';
import { Admin } from 'src/entities/admin.entity';
import { GoogleStrategy } from '../strategies/google.strategy';
import { LocalAdminStrategy } from '../strategies/local-admin-strategy';
import { UserService } from '../Services/Users/userService.service';
import { CrudController } from '../Controllers/CRUD/crud.controller';
import { UserController } from '../Controllers/Users/user.controller';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: `${process.env.JWT_SECRET}`,
      signOptions: { expiresIn: '10000000s' },
    }),
    TypeOrmModule.forFeature([Users, Tokens, ResetToken, Admin]),
  ],
  controllers: [
    AuthController,
    ForgotPassword,
    ChangePassword,
    ResetPassword,
    AdminController,
    CrudController,
    UserController,
  ],
  providers: [
    AuthService,
    MailService,
    JwtStrategy,
    LocalUserStrategy,
    ChangePasswordService,
    ForgotPasswordService,
    ResetPasswordService,
    AdminService,
    GoogleStrategy,
    LocalAdminStrategy,
    UserService,
  ],
})
export class UsersModule {}
