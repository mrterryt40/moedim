import { Test, TestingModule } from '@nestjs/testing';
import { HebrewService } from './hebrew.service';

describe('HebrewService', () => {
  let service: HebrewService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HebrewService],
    }).compile();

    service = module.get<HebrewService>(HebrewService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
