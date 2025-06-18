import { IsOptional, IsString, IsNumber, IsArray, MinLength } from 'class-validator';

export class UpdateFilmDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @IsNumber()
  year?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  genre?: string[];

  @IsOptional()
  @IsString()
  description?: string;
}