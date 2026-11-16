
import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post } from './entities/post.entity';
import { Comment } from '../comments/entities/comment.entity';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
  ) {}

  async create(dto: CreatePostDto, userId: string, imagenUrl?: string) {
    const nuevoPost = new this.postModel({
      ...dto,
      imagenUrl,
      autor: new Types.ObjectId(userId),
    });
    const guardado = await nuevoPost.save();
    return guardado.populate('autor', 'username nombre apellido imagenUrl fotoPerfil');
  }

  async findAll(
    sortBy: 'fecha' | 'likes' = 'fecha',
    page = 1,
    limit = 10,
    userId?: string,
  ) {
    const skip = (page - 1) * limit;

    const sortQuery: Record<string, 1 | -1> =
      sortBy === 'likes'
        ? { likesCount: -1, createdAt: -1 }
        : { createdAt: -1 };

    const filter: Record<string, any> = { activo: true };

    if (userId && Types.ObjectId.isValid(userId.trim())) {
      const cleanUserId = userId.trim();
      filter.$or = [
        { autor: new Types.ObjectId(cleanUserId) },
        { autor: cleanUserId },
      ];
    }

    const [data, total] = await Promise.all([
      this.postModel
        .find(filter)
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .populate('autor', 'username nombre apellido imagenUrl fotoPerfil')
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
        totalPages: Math.ceil(total / limit) || 1,
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
      .populate('autor', 'username nombre apellido imagenUrl fotoPerfil')
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

  

  async getComments(postId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const filter = { postId: new Types.ObjectId(postId), activo: true };

    const [data, total] = await Promise.all([
      this.commentModel
        .find(filter)
        .sort({ createdAt: -1 }) 
        .skip(skip)
        .limit(limit)
        .populate('autor', 'username nombre apellido imagenUrl fotoPerfil')
        .lean()
        .exec(),
      this.commentModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
        hasMore: page * limit < total,
      },
    };
  }

  async addComment(postId: string, userId: string, texto: string) {
    const post = await this.postModel.findOne({ _id: postId, activo: true });
    if (!post) throw new NotFoundException('Publicación no encontrada');

    const comment = await this.commentModel.create({
      postId: new Types.ObjectId(postId),
      autor: new Types.ObjectId(userId),
      texto: texto.trim(),
    });

    await this.postModel.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

    return comment.populate('autor', 'username nombre apellido imagenUrl fotoPerfil');
  }

  async updateComment(commentId: string, userId: string, texto: string) {
    const comment = await this.commentModel.findOne({ _id: commentId, activo: true });
    if (!comment) throw new NotFoundException('Comentario no encontrado');

    if (comment.autor.toString() !== userId) {
      throw new ForbiddenException('Solo el autor puede editar este comentario');
    }

    comment.texto = texto.trim();
    comment.editado = true;
    await comment.save();

    return comment.populate('autor', 'username nombre apellido imagenUrl fotoPerfil');
  }

  async findOne(postId: string) {
    const cleanId = postId.trim();

    if (!Types.ObjectId.isValid(cleanId)) {
      throw new NotFoundException('ID de publicación inválido');
    }

    const objectId = new Types.ObjectId(cleanId);

    
    const post = await this.postModel
      .findOne({
        $or: [{ _id: objectId }, { _id: cleanId as any }],
        activo: { $ne: false },
      })
      .populate('autor', 'username nombre apellido imagenUrl fotoPerfil')
      .lean()
      .exec();

    if (!post) {
      throw new NotFoundException(`No se encontró en la base el post con ID ${cleanId}`);
    }

    return post;
  }
}