import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ElasticsearchService } from '../elasticsearch.service';

// Mock Client to simulate Elasticsearch interactions
class MockElasticsearchClient {
  private mockIndex: any;
  constructor(mockIndex = {}) {
    this.mockIndex = mockIndex;
  }

  index = vi.fn().mockResolvedValue(this.mockIndex);
}

describe('ElasticsearchService', () => {
  let service: ElasticsearchService;
  let mockElasticsearchClient: MockElasticsearchClient;

  beforeEach(() => {
    const mockIndexResult = {
      _index: 'films',
      _id: '1',
      result: 'created',
    };

    mockElasticsearchClient = new MockElasticsearchClient(mockIndexResult);
    service = new ElasticsearchService(mockElasticsearchClient as any);
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

      const errorMockClient = new MockElasticsearchClient();
      (errorMockClient.index as any).mockRejectedValue(new Error('Indexing failed'));
      
      const errorService = new ElasticsearchService(errorMockClient as any);

      await expect(errorService.indexFilm(mockFilm)).rejects.toThrow('Indexing failed');
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