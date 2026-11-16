import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { AuthGuard } from '../guards/auth/auth.guard';

interface AuthenticatedRequest extends Request {
  user?: { sub?: string };
}

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  @Get()
  findAll() {
    return this.usuariosService.findAll();
  }

  @Get('me')
  @UseGuards(AuthGuard)
  findMyProfile(@Req() req: AuthenticatedRequest) {
    return this.usuariosService.findMyProfile(this.getAuthenticatedUserId(req));
  }

  @Patch('me')
  @UseGuards(AuthGuard)
  updateMyProfile(
    @Req() req: AuthenticatedRequest,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ) {
    return this.usuariosService.updateProfile(
      this.getAuthenticatedUserId(req),
      updateUsuarioDto,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
    @Req() req: AuthenticatedRequest,
  ) {
    if (this.getAuthenticatedUserId(req) !== id) {
      throw new ForbiddenException('Solo puedes editar tu propio perfil');
    }
    return this.usuariosService.updateProfile(id, updateUsuarioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usuariosService.remove(id);
  }

  private getAuthenticatedUserId(req: AuthenticatedRequest): string {
    const userId = req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('No se pudo identificar al usuario autenticado');
    }
    return userId;
  }
}