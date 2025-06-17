import { Injectable } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';

@Injectable()
export class ElasticsearchService {
  constructor(private readonly elasticsearchClient: Client) {}

  async indexFilm(film: any): Promise<any> {
    // Validate film data
    if (!film.id || !film.title) {
      throw new Error('Invalid film data');
    }

    try {
      const result = await this.elasticsearchClient.index({
        index: 'films',
        id: film.id,
        body: film,
      });

      return {
        _index: 'films',
        _id: film.id,
        result: 'created',
      };
    } catch (error) {
      throw new Error(`Indexing failed: ${error.message}`);
    }
  }
}