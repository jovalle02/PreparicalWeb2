import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ICountriesApiService, CountryApiResponse } from '../interfaces/countries-api.interface';

@Injectable()
export class RestCountriesApiService implements ICountriesApiService {
  private readonly baseUrl = 'https://restcountries.com/v3.1';

  constructor(private readonly httpService: HttpService) {}

  async findCountryByCode(code: string): Promise<CountryApiResponse> {
    try {
      const url = `${this.baseUrl}/alpha/${code}?fields=cca3,name,region,subregion,capital,population,flags`;
      
      const response = await firstValueFrom(
        this.httpService.get(url)
      );

      const data = response.data;

      return {
        code: data.cca3,
        name: data.name.common,
        region: data.region,
        subregion: data.subregion || 'N/A',
        capital: data.capital?.[0] || 'N/A',
        population: data.population,
        flagUrl: data.flags.png || data.flags.svg,
      };
    } catch (error) {
      if (error.response?.status === 404) {
        throw new HttpException(
          `Country with code ${code} not found`,
          HttpStatus.NOT_FOUND
        );
      }
      throw new HttpException(
        'Error fetching country from external API',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}