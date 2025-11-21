import { Controller, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { CountryResponseDto } from './dto/country-response.dto';

@Controller('countries')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<CountryResponseDto[]> {
    return this.countriesService.findAll();
  }

  @Get(':code')
  @HttpCode(HttpStatus.OK)
  async findByCode(@Param('code') code: string): Promise<CountryResponseDto> {
    return this.countriesService.findByCode(code);
  }
}