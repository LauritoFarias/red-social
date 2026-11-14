import { Injectable } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario, UsuarioDocument } from './entities/usuario.entity';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private readonly usuarioModel: Model<UsuarioDocument>,
  ) {}

  create(createUsuarioDto: CreateUsuarioDto) {
    return this.usuarioModel.create(createUsuarioDto);
  }

  findAll() {
    return this.usuarioModel.find().select('-password').exec();
  }

  findOne(id: string) {
    return this.usuarioModel.findById(id).select('-password').exec();
  }

  update(id: string, updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuarioModel
      .findByIdAndUpdate(id, updateUsuarioDto, { new: true })
      .select('-password')
      .exec();
  }

  remove(id: string) {
    return this.usuarioModel.findByIdAndDelete(id).select('-password').exec();
  }
}