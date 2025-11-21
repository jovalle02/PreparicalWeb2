import { 
  IsString, 
  IsNotEmpty, 
  IsDateString, 
  IsOptional, 
  Length,
  Matches 
} from 'class-validator';

export class CreateTravelPlanDto {
  @IsString()
  @Length(3, 3, { message: 'Country code must be exactly 3 characters' })
  @Matches(/^[A-Z]{3}$/, { 
    message: 'Country code must be 3 uppercase letters (e.g., COL, USA, FRA)' 
  })
  @IsNotEmpty()
  countryCode: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsDateString({}, { message: 'Start date must be a valid ISO date (YYYY-MM-DD)' })
  @IsNotEmpty()
  startDate: string;

  @IsDateString({}, { message: 'End date must be a valid ISO date (YYYY-MM-DD)' })
  @IsNotEmpty()
  endDate: string;

  @IsString()
  @IsOptional()
  notes?: string;
}