import { Controller, Get, Param, HttpCode, HttpStatus, Delete, UseGuards } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { CountryResponseDto } from './dto/country-response.dto';
import { ApiTokenGuard } from 'src/common/guards/api-token/api-token.guard';

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

  @Delete(':code')
  @UseGuards(ApiTokenGuard)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('code') code: string): Promise<{ message: string }> {
    return this.countriesService.remove(code);
  }
}