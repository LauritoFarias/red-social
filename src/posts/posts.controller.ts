import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PostsService } from './posts.service';
import { AuthGuard } from '../guards/auth/auth.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { FileService } from '../file/file.service';

@Controller('posts')
@UseGuards(AuthGuard)
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly fileService: FileService,
  ) {}

  
  private getUserId(req: any): string {
    const u = req.user || req.usuario;
    const id = u?.sub || u?._id || u?.id;
    if (!id) {
      throw new BadRequestException('No se pudo identificar al usuario autenticado en el token');
    }
    return String(id);
  }

  private isAdmin(req: any): boolean {
    const u = req.user || req.usuario;
    return u?.perfil === 'admin';
  }

  @Post()
  @UseInterceptors(FileInterceptor('imagen'))
  async create(
    @Body() createPostDto: CreatePostDto,
    @Req() req: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    
    const userId = this.getUserId(req);

    
    let imagenUrl: string | undefined;
    if (file) {
      imagenUrl = await this.fileService.cloudinaryUploader(file);
    }

    return this.postsService.create(createPostDto, userId, imagenUrl);
  }

  @Get()
  findAll(
    @Query('sortBy') sortBy: 'fecha' | 'likes' = 'fecha',
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('userId') userId?: string,
  ) {
    return this.postsService.findAll(sortBy, Number(page), Number(limit), userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    console.log('Buscando publicación por ID en controller:', id);
    return this.postsService.findOne(id);
  }

  @Post(':id/like')
  toggleLike(@Param('id') id: string, @Req() req: any) {
    return this.postsService.toggleLike(id, this.getUserId(req));
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.postsService.remove(id, this.getUserId(req), this.isAdmin(req));
  }

  @Get(':id/comments')
  getComments(
    @Param('id') postId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.postsService.getComments(postId, Number(page), Number(limit));
  }

  @Post(':id/comments')
  addComment(
    @Param('id') postId: string,
    @Body('texto') texto: string,
    @Req() req: any,
  ) {
    if (!texto || !texto.trim()) {
      throw new BadRequestException('El comentario no puede estar vacío');
    }
    return this.postsService.addComment(postId, this.getUserId(req), texto);
  }

  @Put('comments/:commentId')
  updateComment(
    @Param('commentId') commentId: string,
    @Body('texto') texto: string,
    @Req() req: any,
  ) {
    if (!texto || !texto.trim()) {
      throw new BadRequestException('El comentario no puede estar vacío');
    }
    return this.postsService.updateComment(commentId, this.getUserId(req), texto);
  }
}