import { Test, TestingModule } from '@nestjs/testing';
import { ExitsResolver } from './exits.resolver';

describe('ExitsResolver', () => {
  let resolver: ExitsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExitsResolver],
    }).compile();

    resolver = module.get<ExitsResolver>(ExitsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
