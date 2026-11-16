import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
  Patch
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtService } from '@nestjs/jwt';
import 'multer';
import { AuthService } from './auth.service';
import { CreateUsuarioDto } from '../usuarios/dto/create-usuario.dto';
import { LoginAuthDto } from './dto/login-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('registro')
  @UseInterceptors(
    FileInterceptor('imagen', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/^image\/(png|jpeg|webp|gif)$/)) {
          return cb(
            new BadRequestException('Formato de imagen no válido (solo PNG, JPG, WEBP o GIF).'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async registrar(
    @Body() createUsuarioDto: CreateUsuarioDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('La imagen de perfil es obligatoria.');
    }
    return this.authService.registrar(createUsuarioDto, file);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginAuthDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  async verificarToken(@Headers('authorization') authHeader: string) {
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token no proporcionado.');
    }
    const token = authHeader.split(' ')[1];
    try {
      const payload = await this.jwtService.verifyAsync(token);
      const usuario = await this.authService.getPerfil(payload.sub);
      return { valido: true, payload, usuario };
    } catch {
      throw new UnauthorizedException('Token inválido o expirado.');
    }
  }

  @Get('autorizar')
  async autorizar(@Headers('authorization') authHeader: string) {
    return this.verificarToken(authHeader);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Headers('authorization') authHeader: string) {
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token no proporcionado.');
    }
    const token = authHeader.split(' ')[1];
    try {
      const payload = await this.jwtService.verifyAsync(token);
      return this.authService.refreshToken(payload.sub);
    } catch {
      throw new UnauthorizedException('El token ya expiró o es inválido.');
    }
  }

  @Patch('perfil')
  @UseInterceptors(
    FileInterceptor('imagen', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/^image\/(png|jpeg|webp|gif)$/)) {
          return cb(
            new BadRequestException('Formato de imagen no válido (solo PNG, JPG, WEBP o GIF).'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async actualizarPerfil(
    @Headers('authorization') authHeader: string,
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token no proporcionado.');
    }
    const token = authHeader.split(' ')[1];
    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('Token inválido o expirado.');
    }

    return this.authService.actualizarPerfil(payload.sub, body, file);
  }
}