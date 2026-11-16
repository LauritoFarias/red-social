import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('AuthGuard: No llegó header Authorization Bearer:', authHeader);
      throw new UnauthorizedException('Token no proporcionado');
    }

    const token = authHeader.split(' ')[1];

    try {
      const secret = this.configService.get<string>('JWT_SECRET') || 'secret_fallback';
      const payload = await this.jwtService.verifyAsync(token, { secret });

      (request as any).user = payload;
      (request as any).usuario = payload;
      return true;
    } catch (error) {
      console.error('AuthGuard: Error al verificar el token:', error);
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}