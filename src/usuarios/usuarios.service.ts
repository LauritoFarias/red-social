import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Usuario, UsuarioDocument } from './entities/usuario.entity';
import { Post } from '../posts/entities/post.entity';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private readonly usuarioModel: Model<UsuarioDocument>,
    @InjectModel(Post.name) private readonly postModel: Model<Post>,
  ) {}

  create(createUsuarioDto: CreateUsuarioDto) {
    return this.usuarioModel.create(createUsuarioDto);
  }

  findAll() {
    return this.usuarioModel.find().select('-password -correo -perfil').exec();
  }

  findOne(id: string) {
    return this.usuarioModel.findById(id).select('-password -correo -perfil').exec();
  }

  async findMyProfile(id: string) {
    const [usuario, publicaciones] = await Promise.all([
      this.usuarioModel
        .findById(id)
        .select('nombre apellido username fechaNacimiento descripcion imagenUrl')
        .lean()
        .exec(),
      this.postModel
        .find({ autor: new Types.ObjectId(id), activo: true })
        .sort({ createdAt: -1 })
        .limit(3)
        .populate('autor', 'username nombre apellido imagenUrl')
        .lean()
        .exec(),
    ]);

    if (!usuario) {
      throw new NotFoundException('No se encontró el perfil del usuario');
    }

    return { usuario, publicaciones };
  }

  async updateProfile(id: string, updateUsuarioDto: UpdateUsuarioDto) {
    const usuario = await this.usuarioModel
      .findByIdAndUpdate(id, { $set: updateUsuarioDto }, { new: true, runValidators: true })
      .select('_id')
      .exec();

    if (!usuario) {
      throw new NotFoundException('No se encontró el perfil del usuario');
    }

    return this.findMyProfile(id);
  }

  remove(id: string) {
    return this.usuarioModel.findByIdAndDelete(id).select('-password -correo -perfil').exec();
  }
}