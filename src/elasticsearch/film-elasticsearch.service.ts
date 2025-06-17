import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { FilmElasticsearchService, FilmDocument } from './film-elasticsearch.interface';

@Injectable()
export class FilmElasticsearchServiceImpl implements FilmElasticsearchService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async deleteFilm(id: string): Promise<boolean> {
    console.log('Attempting to delete film with ID:', id);
    if (!id) {
      throw new Error('Film ID is required');
    }

    try {
      const result = await this.elasticsearchService.delete({
        index: 'films',
        id: id
      });

      console.log('Delete result:', result);
      return result.result === 'deleted';
    } catch (error) {
      console.error('Delete error:', error);
      if (error.meta && error.meta.statusCode === 404) {
        return false; // Film not found is not considered an error
      }
      throw error; // Rethrow other errors
    }
  }
}