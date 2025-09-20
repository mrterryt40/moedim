import { Test, TestingModule } from '@nestjs/testing';
import { TorahService } from './torah.service';

describe('TorahService', () => {
  let service: TorahService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TorahService],
    }).compile();

    service = module.get<TorahService>(TorahService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
