import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { FilmElasticsearchServiceImpl } from './film-elasticsearch.service';

class MockElasticsearchService {
  async delete(params: { index: string; id: string }) {
    if (params.id === 'film123') {
      return { result: 'deleted' };
    }
    if (params.id === 'nonexistent-film') {
      const error = new Error('Not Found') as any;
      error.meta = { statusCode: 404 };
      throw error;
    }
    throw new Error('Server error');
  }
}

describe('FilmElasticsearchService', () => {
  let service: FilmElasticsearchServiceImpl;
  let mockElasticsearchService: MockElasticsearchService;

  beforeEach(() => {
    mockElasticsearchService = new MockElasticsearchService();
    service = new FilmElasticsearchServiceImpl(mockElasticsearchService as unknown as ElasticsearchService);
  });

  it('should delete a film successfully', async () => {
    const filmId = 'film123';
    const result = await service.deleteFilm(filmId);

    expect(result).toBe(true);
  });

  it('should return false when film is not found', async () => {
    const filmId = 'nonexistent-film';
    const result = await service.deleteFilm(filmId);

    expect(result).toBe(false);
  });

  it('should throw an error for empty film ID', async () => {
    await expect(service.deleteFilm('')).rejects.toThrow('Film ID is required');
  });

  it('should throw an error for other Elasticsearch errors', async () => {
    const filmId = 'other-film';
    await expect(service.deleteFilm(filmId)).rejects.toThrow('Server error');
  });
});