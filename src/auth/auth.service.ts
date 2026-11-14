import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import 'multer';
import { Usuario, UsuarioDocument } from '../usuarios/entities/usuario.entity';
import { CreateUsuarioDto } from '../usuarios/dto/create-usuario.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { FileService } from '../file/file.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Usuario.name) private readonly usuarioModel: Model<UsuarioDocument>,
    private readonly fileService: FileService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginAuthDto: LoginAuthDto) {
    const identificador = loginAuthDto.identificador.trim();

    const user = await this.usuarioModel.findOne({
      $or: [
        { correo: identificador.toLowerCase() },
        { username: identificador },
      ],
    });

    if (!user || !(await bcrypt.compare(loginAuthDto.password, user.password))) {
      throw new UnauthorizedException('Credenciales incorrectas.');
    }

    return this.generateToken(user);
  }

  async registrar(createUsuarioDto: CreateUsuarioDto, file: Express.Multer.File) {
    const existe = await this.usuarioModel.findOne({
      $or: [
        { correo: createUsuarioDto.correo.toLowerCase() },
        { username: createUsuarioDto.username },
      ],
    });

    if (existe) {
      throw new ConflictException('El correo o nombre de usuario ya está registrado.');
    }

    const imagenUrl = await this.fileService.cloudinaryUploader(file);
    const hashedPassword = await bcrypt.hash(createUsuarioDto.password, 10);

    const newUser = await this.usuarioModel.create({
      ...createUsuarioDto,
      password: hashedPassword,
      imagenUrl,
      perfil: 'usuario',
    });

    return this.generateToken(newUser);
  }

  async getPerfil(id: string) {
    const user = await this.usuarioModel.findById(id).select('-password');

    if (!user) {
      throw new NotFoundException('No se pudo obtener el perfil.');
    }

    return user;
  }

  async generateToken(usuario: UsuarioDocument) {
    const payload = {
      sub: usuario._id.toString(),
      correo: usuario.correo,
      username: usuario.username,
      perfil: usuario.perfil,
    };

    const { password, ...usuarioSinPassword } = usuario.toObject();

    return {
      access_token: await this.jwtService.signAsync(payload),
      usuario: usuarioSinPassword,
    };
  }

  setTokenCookie(res: Response, token: string) {
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: false,
      maxAge: 1000 * 60 * 15, // 15 minutos (o el tiempo que definas para tu sesión)
    });
  }
}