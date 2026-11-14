import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
  IsDateString,
  IsOptional,
  IsIn,
} from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  @MinLength(2)
  @MaxLength(50)
  nombre: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido es obligatorio.' })
  @MinLength(2)
  @MaxLength(50)
  apellido: string;

  @IsEmail({}, { message: 'El formato del correo no es válido.' })
  @IsNotEmpty({ message: 'El correo es obligatorio.' })
  correo: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre de usuario es obligatorio.' })
  @Matches(/^[a-zA-Z0-9._]{3,20}$/, {
    message: 'El usuario debe tener entre 3 y 20 caracteres (letras, números, puntos o guiones bajos).',
  })
  username: string;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria.' })
  @Matches(/^(?=.*[A-Z])(?=.*\d).{8,}$/, {
    message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.',
  })
  password: string;

  @IsDateString({}, { message: 'La fecha de nacimiento debe ser una fecha válida.' })
  @IsNotEmpty({ message: 'La fecha de nacimiento es obligatoria.' })
  fechaNacimiento: string;

  @IsOptional()
  @IsString()
  @MaxLength(350, { message: 'La descripción no puede superar los 350 caracteres.' })
  descripcion?: string;

  @IsOptional()
  @IsIn(['usuario', 'administrador'])
  perfil?: string;
}