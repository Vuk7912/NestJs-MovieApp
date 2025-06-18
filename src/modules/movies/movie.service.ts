import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

interface UpdateMovieDto {
  title?: string;
  description?: string;
  year?: number;
  genres?: string[];
}

@Injectable()
export class MovieService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async updateFilm(id: string, updateMovieDto: UpdateMovieDto) {
    try {
      // First, check if movie exists
      await this.elasticsearchService.get({
        index: 'movies',
        id
      });

      // Perform update
      const response = await this.elasticsearchService.update({
        index: 'movies',
        id,
        doc: updateMovieDto
      });

      return {
        id,
        ...updateMovieDto
      };
    } catch (error) {
      if (error.message.includes('Movie not found')) {
        throw new Error('Movie not found');
      }
      throw new Error('Update failed');
    }
  }
}