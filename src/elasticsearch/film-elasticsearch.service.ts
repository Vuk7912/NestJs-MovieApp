import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { FilmElasticsearchService, FilmDocument } from './film-elasticsearch.interface';

@Injectable()
export class FilmElasticsearchServiceImpl implements FilmElasticsearchService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async deleteFilm(id: string): Promise<boolean> {
    if (!id) {
      throw new Error('Film ID is required');
    }

    try {
      const result = await this.elasticsearchService.delete({
        index: 'films',
        id: id
      });

      return result.result === 'deleted';
    } catch (error) {
      if (error.meta && error.meta.statusCode === 404) {
        return false; // Film not found is not considered an error
      }
      throw error; // Rethrow other errors
    }
  }
}