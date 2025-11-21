export class CountryResponseDto {
  code: string;
  name: string;
  region: string;
  subregion: string;
  capital: string;
  population: number;
  flagUrl: string;
  source: 'cache' | 'api';
  createdAt?: Date;
  updatedAt?: Date;
}