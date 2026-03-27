import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class FilmsService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async updateFilm(id: string, updateFilmDto: any) {
    try {
      const response = await this.elasticsearchService.update({
        index: 'films',
        id,
        body: {
          doc: updateFilmDto
        }
      });
      return response;
    } catch (error) {
      throw new Error(`Failed to update film: ${error.message}`);
    }
  }
}