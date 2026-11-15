import { Controller, Get, Post, Delete, Param, Query, UseGuards, Req } from '@nestjs/common';
import { PostsService } from './posts.service';
import { AuthGuard } from '../guards/auth/auth.guard';

@Controller('posts')
@UseGuards(AuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  findAll(
    @Query('sortBy') sortBy: 'fecha' | 'likes' = 'fecha',
    @Query('page') page = '1',
    @Query('limit') limit = '5',
  ) {
    return this.postsService.findAll(sortBy, Number(page), Number(limit));
  }

  @Post(':id/like')
  toggleLike(@Param('id') id: string, @Req() req: any) {
    return this.postsService.toggleLike(id, req.user.sub);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.postsService.remove(id, req.user.sub, req.user.perfil === 'admin');
  }
}