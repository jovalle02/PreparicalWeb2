import { Injectable, Inject } from '@nestjs/common';
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
}