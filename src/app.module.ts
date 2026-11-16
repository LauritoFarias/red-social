import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UsuariosModule } from './usuarios/usuarios.module';
import { FileService } from './file/file.service';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { CommentModule } from './comments/comments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'secret_fallback',
        signOptions: {
          expiresIn: (configService.get<string>('JWT_EXPIRES_IN')) as any,
        },
      }),
    }),
    MongooseModule.forRoot(process.env.CONNECTION_STRING!),
    UsuariosModule,
    AuthModule,
    PostsModule,
    CommentModule,
  ],
  controllers: [AppController],
  providers: [AppService, FileService],
})
export class AppModule {}