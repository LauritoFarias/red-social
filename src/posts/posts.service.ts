import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post } from './entities/post.entity';

@Injectable()
export class PostsService {
  constructor(@InjectModel(Post.name) private postModel: Model<Post>) {}

  async findAll(sortBy: 'fecha' | 'likes' = 'fecha', page = 1, limit = 5) {
    const skip = (page - 1) * limit;
    
    const sortQuery: Record<string, 1 | -1> =
      sortBy === 'likes'
        ? { likesCount: -1, createdAt: -1 }
        : { createdAt: -1 };

    const filter = { activo: true };

    const [data, total] = await Promise.all([
      this.postModel
        .find(filter)
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .populate('autor', 'username nombre fotoPerfil')
        .lean()
        .exec(),
      this.postModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async toggleLike(postId: string, userId: string) {
    const post = await this.postModel.findOne({ _id: postId, activo: true });
    if (!post) throw new NotFoundException('Publicación no encontrada');

    const userObjectId = new Types.ObjectId(userId);
    const hasLiked = post.likes.some((id) => id.equals(userObjectId));

    const update = hasLiked
      ? { $pull: { likes: userObjectId }, $inc: { likesCount: -1 } }
      : { $addToSet: { likes: userObjectId }, $inc: { likesCount: 1 } };

    return this.postModel
      .findByIdAndUpdate(postId, update, { new: true })
      .populate('autor', 'username nombre apellido imagenUrl')
      .lean();
  }

  async remove(postId: string, userId: string, isAdmin = false) {
    const post = await this.postModel.findOne({ _id: postId, activo: true });
    if (!post) throw new NotFoundException('Publicación no encontrada');

    if (post.autor.toString() !== userId && !isAdmin) {
      throw new ForbiddenException('No tienes permiso para eliminar esta publicación');
    }

    post.activo = false;
    await post.save();
    return { deleted: true, postId };
  }
}