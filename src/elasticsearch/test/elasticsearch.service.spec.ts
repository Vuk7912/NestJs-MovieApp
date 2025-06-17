import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ElasticsearchService } from '../elasticsearch.service';
import { Client } from '@elastic/elasticsearch';

class MockElasticsearchClient {
  index = vi.fn();
  search = vi.fn();
  delete = vi.fn();
  update = vi.fn();
}

describe('ElasticsearchService', () => {
  let service: ElasticsearchService;
  let mockElasticsearchClient: MockElasticsearchClient;

  beforeEach(async () => {
    mockElasticsearchClient = new MockElasticsearchClient();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ElasticsearchService,
        {
          provide: Client,
          useValue: mockElasticsearchClient,
        },
      ],
    }).compile();

    service = module.get<ElasticsearchService>(ElasticsearchService);
  });

  describe('indexFilm', () => {
    it('should successfully index a film', async () => {
      const mockFilm = {
        id: '1',
        title: 'Test Film',
        description: 'A test film description',
        genres: ['Action'],
        releaseYear: 2023,
      };

      mockElasticsearchClient.index.mockResolvedValue({
        _index: 'films',
        _id: '1',
        result: 'created',
      });

      const result = await service.indexFilm(mockFilm);

      expect(mockElasticsearchClient.index).toHaveBeenCalledWith({
        index: 'films',
        id: mockFilm.id,
        body: mockFilm,
      });
      expect(result).toEqual({
        _index: 'films',
        _id: '1',
        result: 'created',
      });
    });

    it('should handle indexing errors', async () => {
      const mockFilm = {
        id: '2',
        title: 'Error Film',
        description: 'A film that will cause an error',
      };

      const mockError = new Error('Indexing failed');
      mockElasticsearchClient.index.mockRejectedValue(mockError);

      await expect(service.indexFilm(mockFilm)).rejects.toThrow('Indexing failed');
    });

    it('should throw an error if film is incomplete', async () => {
      const incompleteFilm = {
        id: '3',
      };

      await expect(service.indexFilm(incompleteFilm)).rejects.toThrow('Invalid film data');
    });

    it('should handle large film data', async () => {
      const largeMockFilm = {
        id: '4',
        title: 'Large Film'.repeat(100),
        description: 'A very long description'.repeat(500),
        genres: ['Epic', 'Drama', 'Action'],
        releaseYear: 2023,
      };

      mockElasticsearchClient.index.mockResolvedValue({
        _index: 'films',
        _id: '4',
        result: 'created',
      });

      const result = await service.indexFilm(largeMockFilm);

      expect(mockElasticsearchClient.index).toHaveBeenCalledWith({
        index: 'films',
        id: largeMockFilm.id,
        body: largeMockFilm,
      });
      expect(result).toBeDefined();
    });
  });
});