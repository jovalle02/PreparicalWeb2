import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from './entities/country.entity';
import { CountryResponseDto } from './dto/country-response.dto';
import type { ICountriesApiService } from './interfaces/countries-api.interface';

@Injectable()
export class CountriesService {
  constructor(
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    @Inject('COUNTRIES_API_SERVICE')
    private readonly countriesApiService: ICountriesApiService,
  ) {}

  async findAll(): Promise<CountryResponseDto[]> {
    const countries = await this.countryRepository.find();
    return countries.map(country => this.mapToResponseDto(country, 'cache'));
  }

  async findByCode(code: string): Promise<CountryResponseDto> {
    const upperCode = code.toUpperCase();

    let country = await this.countryRepository.findOne({
      where: { code: upperCode },
    });
    if (country) {
      return this.mapToResponseDto(country, 'cache');
    }
    const countryData = await this.countriesApiService.findCountryByCode(upperCode);
    country = this.countryRepository.create(countryData);
    await this.countryRepository.save(country);
    return this.mapToResponseDto(country, 'api');
  }

  private mapToResponseDto(
    country: Country,
    source: 'cache' | 'api',
  ): CountryResponseDto {
    return {
      code: country.code,
      name: country.name,
      region: country.region,
      subregion: country.subregion,
      capital: country.capital,
      population: country.population,
      flagUrl: country.flagUrl,
      source,
      createdAt: country.createdAt,
      updatedAt: country.updatedAt,
    };
  }

  async remove(code: string): Promise<{ message: string }> {
  const upperCode = code.toUpperCase();

  const country = await this.countryRepository.findOne({
    where: { code: upperCode },
  });

  if (!country) {
    throw new NotFoundException(`Country with code ${upperCode} not found in cache`);
  }

  const hasPlans = await this.checkIfCountryHasPlans(upperCode);
  
  if (hasPlans) {
    throw new BadRequestException(
      `Cannot delete country ${upperCode}. There are travel plans associated with it.`
    );
  }

  await this.countryRepository.remove(country);

  return {
    message: `Country ${upperCode} successfully removed from cache`,
  };
}

private async checkIfCountryHasPlans(countryCode: string): Promise<boolean> {
  const connection = this.countryRepository.manager.connection;
  const travelPlanRepository = connection.getRepository('TravelPlan');
  
  const count = await travelPlanRepository.count({
    where: { countryCode },
  });

  return count > 0;
}
}