export interface ICountriesApiService {
  findCountryByCode(code: string): Promise<CountryApiResponse>;
}

export interface CountryApiResponse {
  code: string;
  name: string;
  region: string;
  subregion: string;
  capital: string;
  population: number;
  flagUrl: string;
}