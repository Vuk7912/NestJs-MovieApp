import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { UpdateFilmDto } from './dto/update-film.dto';
import { Film } from './interfaces/film.interface';

@Injectable()
export class MovieService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async updateFilm(id: string, updateFilmDto: UpdateFilmDto): Promise<Film> {
    try {
      // First, verify the film exists
      const existingFilmResponse = await this.elasticsearchService.get({
        index: 'films',
        id,
      });

      const existingFilm = existingFilmResponse._source as Film;

      // Validate update data
      if (updateFilmDto.title && updateFilmDto.title.trim() === '') {
        throw new BadRequestException('Title cannot be empty');
      }

      // Perform update
      await this.elasticsearchService.update({
        index: 'films',
        id,
        body: {
          doc: updateFilmDto,
        },
      });

      // Return updated film
      return {
        ...existingFilm,
        ...updateFilmDto,
      };
    } catch (error) {
      if (error.message === 'Not Found') {
        throw new NotFoundException(`Film with ID ${id} not found`);
      }
      throw error;
    }
  }
}