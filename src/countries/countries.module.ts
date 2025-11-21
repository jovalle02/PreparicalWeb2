import { Module } from '@nestjs/common';
import { CountriesController } from './countries.controller';
import { CountriesService } from './countries.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Country } from './entities/country.entity';
import { RestCountriesApiService } from './providers/rest-countries-api.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Country]),
    HttpModule
  ],
  controllers: [CountriesController],
  providers: [
    CountriesService,
    {
      provide: 'COUNTRIES_API_SERVICE',
      useClass: RestCountriesApiService,
    },
  ],
  exports: [CountriesService],
})
export class CountriesModule {}
