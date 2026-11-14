import { IsNotEmpty, IsString } from 'class-validator';

export class LoginAuthDto {
  @IsString()
  @IsNotEmpty({ message: 'Ingresá tu correo o nombre de usuario.' })
  identificador: string;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria.' })
  password: string;
}