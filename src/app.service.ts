import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {

  constructor() {
    console.log('AppService constructor called');
  }

  getall(): string {
    return 'Todos los usuarios';
  }
  getHello(): string {
    return 'Hello World!';
  }

  create(): string {
    return 'Usuario creado';
  }
}
