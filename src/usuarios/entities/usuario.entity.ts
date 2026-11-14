import { HydratedDocument } from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type UsuarioDocument = HydratedDocument<Usuario>;

@Schema({ timestamps: true })
export class Usuario {
  @Prop({ required: true, trim: true })
  nombre: string;

  @Prop({ required: true, trim: true })
  apellido: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  correo: string;

  @Prop({ required: true, unique: true, trim: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  fechaNacimiento: Date;

  @Prop({ maxlength: 350, default: '' })
  descripcion: string;

  @Prop({ required: true })
  imagenUrl: string;

  @Prop({ default: 'usuario', enum: ['usuario', 'administrador'] })
  perfil: string;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);