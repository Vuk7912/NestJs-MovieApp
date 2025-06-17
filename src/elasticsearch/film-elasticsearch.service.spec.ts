import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { FilmElasticsearchServiceImpl } from './film-elasticsearch.service';

describe('FilmElasticsearchService', () => {
  let service: FilmElasticsearchServiceImpl;
  let mockElasticsearchService: {
    delete: vi.Mock;
  };

  beforeEach(async () => {
    mockElasticsearchService = {
      delete: vi.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilmElasticsearchServiceImpl,
        {
          provide: ElasticsearchService,
          useValue: mockElasticsearchService
        }
      ]
    }).compile();

    service = module.get<FilmElasticsearchServiceImpl>(FilmElasticsearchServiceImpl);
  });

  it('should delete a film successfully', async () => {
    const filmId = 'film123';
    mockElasticsearchService.delete.mockResolvedValue({ result: 'deleted' });

    const result = await service.deleteFilm(filmId);

    expect(result).toBe(true);
    expect(mockElasticsearchService.delete).toHaveBeenCalledWith({
      index: 'films',
      id: filmId
    });
  });

  it('should return false when film is not found', async () => {
    const filmId = 'nonexistent-film';
    const notFoundError = new Error('Not Found');
    (notFoundError as any).meta = { 
      statusCode: 404 
    };
    mockElasticsearchService.delete.mockRejectedValue(notFoundError);

    const result = await service.deleteFilm(filmId);

    expect(result).toBe(false);
  });

  it('should throw an error for empty film ID', async () => {
    await expect(service.deleteFilm('')).rejects.toThrow('Film ID is required');
  });

  it('should throw an error for other Elasticsearch errors', async () => {
    const filmId = 'film123';
    const serverError = new Error('Server error');
    mockElasticsearchService.delete.mockRejectedValue(serverError);

    await expect(service.deleteFilm(filmId)).rejects.toThrow('Server error');
  });
});