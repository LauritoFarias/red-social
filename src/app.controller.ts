import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('usuarios')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('all')
  getall(): string {
    return this.appService.getall();
  }

  getHello(): string {
    return this.appService.getHello();
  }

  @Post('create')
  create(): string {
    return this.appService.create();
  }
}
