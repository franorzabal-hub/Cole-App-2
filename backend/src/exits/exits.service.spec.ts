import { Test, TestingModule } from '@nestjs/testing';
import { ExitsService } from './exits.service';

describe('ExitsService', () => {
  let service: ExitsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExitsService],
    }).compile();

    service = module.get<ExitsService>(ExitsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
