import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Usuario, UsuarioSchema } from '../usuarios/entities/usuario.entity';
import { FileService } from '../file/file.service';
import { ConfigModule } from '@nestjs/config';
import { AuthGuard } from '../guards/auth/auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forFeature([{ name: Usuario.name, schema: UsuarioSchema }]),
  ],
  controllers: [AuthController],
  providers: [AuthService, FileService, AuthGuard],
  exports: [AuthGuard],
})
export class AuthModule {}