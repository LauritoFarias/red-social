import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Post } from '../../posts/entities/post.entity';

@Schema({ timestamps: true })
export class Comment extends Document {
  @Prop({ type: Types.ObjectId, ref: Post.name, required: true, index: true })
  postId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Usuario.name, required: true })
  autor: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 1000 })
  texto: string;

  @Prop({ default: false })
  editado: boolean;

  @Prop({ default: true })
  activo: boolean;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);