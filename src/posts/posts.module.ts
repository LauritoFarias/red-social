import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { Post, PostSchema } from './entities/post.entity'; // Ajusta la ruta si lo pusiste en schemas/post.schema
import { AuthModule } from '../auth/auth.module'; // Solo si necesitas AuthGuard y JwtModule no es global

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema }, // <-- Esto crea y provee el "PostModel" que te pide el error
    ]),
    AuthModule,
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}