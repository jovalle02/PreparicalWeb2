import { Test, TestingModule } from '@nestjs/testing';
import { TravelPlansService } from './travel-plans.service';

describe('TravelPlansService', () => {
  let service: TravelPlansService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TravelPlansService],
    }).compile();

    service = module.get<TravelPlansService>(TravelPlansService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
