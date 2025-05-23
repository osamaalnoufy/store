import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Users } from 'src/entities/users.entity';
import { SignUp } from 'src/users/Dtos/Auth/authDto.dto';
import { DataSource, MoreThanOrEqual, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Tokens } from 'src/entities/tokens.entity';
import { MailService } from 'src/mailer/mailer.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Admin } from 'src/entities/admin.entity';
type UserDate = {
  id: string;
  email: string;
  name: string;
};
@Injectable()
export class AuthService {
  constructor(
    private dataSource: DataSource,
    private mailService: MailService,
    private jwtService: JwtService,
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
    @InjectRepository(Tokens)
    private tokens: Repository<Tokens>,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
  ) {}
  async findNextAvailableId(): Promise<number> {
    const query = `
      WITH gaps AS (
        SELECT 1 AS id
        WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 1)
        UNION ALL
        SELECT MIN(id) + 1
        FROM (SELECT id, LEAD(id) OVER (ORDER BY id) AS next_id
        FROM users) AS subquery
        WHERE id + 1 <> next_id OR next_id IS NULL
      )
      SELECT COALESCE(MIN(id), 1) AS next_id FROM gaps;`;
    const result = await this.dataSource.query(query);
    return result[0]?.next_id || 1;
  }
  async loginAdmin(admin: Admin) {
    const admin_info = {
      id: admin.id,
      email: admin.email,
      role: admin.role,
    };
    const token = {
      access_token: await this.jwtService.signAsync(admin_info),
    };
    return {
      admin_info,
      token,
    };
  }
  async signUp(signUp: SignUp): Promise<{ message: string }> {
    const { email, phone } = signUp;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const conflictQuery =
        'SELECT 1 FROM users WHERE email = $1 OR phone = $2';
      const conflicts = await queryRunner.query(conflictQuery, [email, phone]);
      if (conflicts.length > 0) {
        await queryRunner.rollbackTransaction();
        throw new ConflictException(
          'Email or phone number already exists. Please choose a different one.',
        );
      }
      const nextId = await this.findNextAvailableId();
      const newUser = queryRunner.manager.create(Users, {
        id: nextId, 
        name: signUp.name,
        email: signUp.email,
        phone: signUp.phone,
        password: signUp.password,
        address: signUp.address,
        age: signUp.age,
        role: 'user',
        image: 'null',
      });

      await queryRunner.manager.save(newUser);

      const { nanoid } = require('fix-esm').require('nanoid');
      const token = nanoid(64);

      const expiry_date = new Date();
      expiry_date.setMinutes(expiry_date.getMinutes() + 10);

      const resetTokenObject = queryRunner.manager.create(Tokens, {
        token: token,
        user: newUser,
        expiry_date: expiry_date,
      });
      await queryRunner.manager.save(resetTokenObject);
      this.mailService.sendToken(email, token);
      await queryRunner.commitTransaction();
      return {
        message:
          'successfully registerer, Please check your email for verification code.',
      };
    } catch (err) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
  async login(user: Users) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    const token = await this.jwtService.signAsync(payload, {
      secret: `${process.env.JWT_SECRET}`,
    });
    const refresh_token = await this.jwtService.signAsync(
      { ...payload, countEx: 5 },
      { secret: process.env.JWT_SECRET_REFRESHTOKEN, expiresIn: '7d' },
    );
    return {
      status: 200,
      message: 'user logged in successfully',
      data: user,
      access_token: token,
      refresh_token: refresh_token,
    };
  }
  async verifyTheEmail(token: string): Promise<{ message: string }> {
    const tokens = await this.tokens.findOne({
      where: {
        token: token,
        expiry_date: MoreThanOrEqual(new Date()),
      },
    });
    if (!tokens) {
      throw new NotFoundException('Token not found or has been expired');
    } else {
      await this.tokens.remove(tokens);
      return { message: 'Email verified successfully' };
    }
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
  async validateAdmin(email: string, password: string): Promise<any> {
    const admin = await this.adminRepository.findOne({ where: { email } });
    if (admin && (await bcrypt.compare(password, admin.password))) {
      const { password, ...result } = admin;
      return result;
    }
    return null;
  }

  async validateUserByGoogle(userDate: UserDate): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const user = await this.userRepository.findOne({
        where: {
          email: userDate.email,
        },
      });
      if (!user) {
        const nextId = await this.findNextAvailableId();
        const newUser = queryRunner.manager.create(Users, {
          id: nextId,
          email: userDate.email,
          name: userDate.name,
          age: null,
          address: null,
          password: null,
          phone: null,
          role: 'user',
          image: null,
        });
        await queryRunner.manager.save(newUser);
        const { nanoid } = require('fix-esm').require('nanoid');
        const token = nanoid(64);

        const expiry_date = new Date();
        expiry_date.setMinutes(expiry_date.getMinutes() + 10);

        const resetTokenObject = queryRunner.manager.create(Tokens, {
          token: token,
          user: newUser,
          expiry_date: expiry_date,
        });
        await queryRunner.manager.save(resetTokenObject);
        await this.mailService.sendToken(userDate.email, token);
        const payload = {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
        };
        const tokenjwt = await this.jwtService.signAsync(payload, {
          secret: `${process.env.JWT_SECRET}`,
        });
        const refresh_token = await this.jwtService.signAsync(
          { ...payload, countEx: 5 },
          { secret: process.env.JWT_SECRET_REFRESHTOKEN, expiresIn: '7d' },
        );
        const { password, ...result } = newUser;
        await queryRunner.commitTransaction();
        return {
          status: 200,
          message: 'user logged in successfully',
          data: user,
          access_token: token,
          refresh_token: refresh_token,
        };
      } else {
        const payload2 = {
          id: user.id,
          email: user.email,
          role: user.role,
        };
        const tokenjwt = await this.jwtService.signAsync(payload2, {
          secret: `${process.env.JWT_SECRET}`,
        });
        const refresh_token = await this.jwtService.signAsync(
          { ...payload2, countEx: 5 },
          { secret: process.env.JWT_SECRET_REFRESHTOKEN, expiresIn: '7d' },
        );
        const { password, ...result } = user;
        await queryRunner.commitTransaction();
        return {
          status: 200,
          message: 'user logged in successfully',
          data: user,
          access_token: tokenjwt,
          refresh_token: refresh_token,
        };
      }
    } catch (err) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_SECRET_REFRESHTOKEN,
      });
      console.log(payload);
      if (!payload || payload.countEx <= 0) {
        throw new UnauthorizedException(
          'Invalid refresh token,please go to login again',
        );
      }
      const currentTimestamp = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < currentTimestamp) {
        throw new UnauthorizedException(
          'Refresh token has expired, please login again',
        );
      }
      const { exp, countEx, ...newPayload } = payload;
      const newPayoadForAccessToken = {
        id: newPayload.id,
        email: newPayload.email,
        role: newPayload.role,
      };
      const access_token = await this.jwtService.signAsync(
        newPayoadForAccessToken,
        {
          secret: process.env.JWT_SECRET,
        },
      );
      const newCountEx = countEx - 1;
      const refresh_token = await this.jwtService.signAsync(
        { ...newPayload, countEx: newCountEx },
        {
          secret: process.env.JWT_SECRET_REFRESHTOKEN,
          expiresIn: '7d',
        },
      );
      return {
        status: 201,
        message: 'Refresh Access token successfully',
        access_token,
        refresh_token,
      };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException(
          'Refresh token has expired, please login again',
        );
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException(
          'Invalid refresh token, please login again',
        );
      }
      throw error;
    }
  }
}
