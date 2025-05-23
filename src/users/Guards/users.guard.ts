import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Roles } from './roles.decorator';

@Injectable()
export class UsersGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}
  extractTokenFromHeader(request: Request): string | null {
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.split(' ')[0] === 'Bearer') {
      return authHeader.split(' ')[1];
    }
    return null;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    const roles = this.reflector.get(Roles, context.getHandler());

    if (!roles) {
      return true;
    }

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: `${process.env.JWT_SECRET}`,
      });

      if (payload._id && payload.role.toLowerCase() === 'admin') {
        request['user'] = payload;
        return true;
      }

      if (
        !payload.role ||
        payload.role === '' ||
        !roles.includes(payload.role)
      ) {
        throw new UnauthorizedException();
      }

      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }
}
