import { Test, TestingModule } from '@nestjs/testing';
import { HebrewController } from './hebrew.controller';

describe('HebrewController', () => {
  let controller: HebrewController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HebrewController],
    }).compile();

    controller = module.get<HebrewController>(HebrewController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
