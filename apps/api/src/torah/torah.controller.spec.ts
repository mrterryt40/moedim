import { Test, TestingModule } from '@nestjs/testing';
import { TorahController } from './torah.controller';

describe('TorahController', () => {
  let controller: TorahController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TorahController],
    }).compile();

    controller = module.get<TorahController>(TorahController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
