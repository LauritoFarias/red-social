import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Schema({ timestamps: true })
export class Post extends Document {
  @Prop({ required: true })
  titulo: string;

  @Prop({ required: true })
  descripcion: string;

  @Prop()
  imagenUrl?: string;

  @Prop({ type: Types.ObjectId, ref: Usuario.name, required: true })
  autor: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: Usuario.name }], default: [] })
  likes: Types.ObjectId[];

  @Prop({ default: 0, index: true })
  likesCount: number;

  @Prop({ default: true })
  activo: boolean;

  @Prop({ default: 0 })
  commentsCount: number;
}

export const PostSchema = SchemaFactory.createForClass(Post);