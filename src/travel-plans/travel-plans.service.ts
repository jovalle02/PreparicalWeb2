import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TravelPlan } from './entities/travel-plan.entity';
import { CreateTravelPlanDto } from './dto/create-travel-plan.dto';
import { TravelPlanResponseDto } from './dto/travel-plan-response.dto';
import { CountriesService } from '../countries/countries.service';

@Injectable()
export class TravelPlansService {
  constructor(
    @InjectRepository(TravelPlan)
    private readonly travelPlanRepository: Repository<TravelPlan>,
    private readonly countriesService: CountriesService,
  ) {}

  async create(createTravelPlanDto: CreateTravelPlanDto): Promise<TravelPlanResponseDto> {
    const startDate = new Date(createTravelPlanDto.startDate);
    const endDate = new Date(createTravelPlanDto.endDate);

    if (endDate < startDate) {
      throw new BadRequestException('End date must be after or equal to start date');
    }

    const upperCode = createTravelPlanDto.countryCode.toUpperCase();
    const country = await this.countriesService.findByCode(upperCode);

    const travelPlan = this.travelPlanRepository.create({
      ...createTravelPlanDto,
      countryCode: upperCode,
      startDate,
      endDate,
    });

    const saved = await this.travelPlanRepository.save(travelPlan);

    return this.mapToResponseDto(saved, country);
  }

  async findAll(): Promise<TravelPlanResponseDto[]> {
    const plans = await this.travelPlanRepository.find({
      relations: ['country'],
    });

    return plans.map(plan => this.mapToResponseDto(plan));
  }

  async findOne(id: string): Promise<TravelPlanResponseDto> {
    const plan = await this.travelPlanRepository.findOne({
      where: { id },
      relations: ['country'],
    });

    if (!plan) {
      throw new NotFoundException(`Travel plan with ID ${id} not found`);
    }

    return this.mapToResponseDto(plan);
  }

  private mapToResponseDto(plan: TravelPlan, country?: any): TravelPlanResponseDto {
    return {
      id: plan.id,
      countryCode: plan.countryCode,
      country: plan.country ? {
        code: plan.country.code,
        name: plan.country.name,
        region: plan.country.region,
        capital: plan.country.capital,
        flagUrl: plan.country.flagUrl,
      } : (country ? {
        code: country.code,
        name: country.name,
        region: country.region,
        capital: country.capital,
        flagUrl: country.flagUrl,
      } : undefined),
      title: plan.title,
      startDate: plan.startDate,
      endDate: plan.endDate,
      notes: plan.notes,
      createdAt: plan.createdAt,
    };
  }
}