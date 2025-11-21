import { Test, TestingModule } from '@nestjs/testing';
import { TravelPlansController } from './travel-plans.controller';

describe('TravelPlansController', () => {
  let controller: TravelPlansController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TravelPlansController],
    }).compile();

    controller = module.get<TravelPlansController>(TravelPlansController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
