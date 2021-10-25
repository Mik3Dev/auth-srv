import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return App Info', () => {
      const result = appController.getHello();
      expect(result.name).toBe('Auth Service');
      expect(result.version).not.toBeNull();
      expect(result.datetime).not.toBeNull();
    });
  });
});
