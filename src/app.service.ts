import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      name: 'Auth Service',
      version: '1.0.0',
      datetime: new Date().toISOString(),
    };
  }
}
