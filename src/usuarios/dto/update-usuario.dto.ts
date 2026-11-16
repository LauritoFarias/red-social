import {
  IsDateString,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  IsUrl,
} from 'class-validator';

export class UpdateUsuarioDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  nombre?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  apellido?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9._]{3,20}$/)
  username?: string;

  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;

  @IsOptional()
  @IsString()
  @MaxLength(350)
  descripcion?: string;

  @IsOptional()
  @IsUrl()
  imagenUrl?: string;
}
