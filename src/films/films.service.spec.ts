import { Test, TestingModule } from '@nestjs/testing';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { FilmsService } from './films.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('FilmsService', () => {
  let filmsService: FilmsService;
  let elasticsearchService: {
    update: jest.Mock
  };

  beforeEach(async () => {
    const mockElasticsearchService = {
      update: vi.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilmsService,
        {
          provide: ElasticsearchService,
          useValue: mockElasticsearchService
        }
      ]
    }).compile();

    filmsService = module.get<FilmsService>(FilmsService);
    elasticsearchService = module.get(ElasticsearchService);
  });

  describe('updateFilm', () => {
    it('should successfully update a film', async () => {
      const mockFilmId = 'film123';
      const updateFilmDto = { title: 'Updated Film Title', year: 2023 };
      const mockUpdateResponse = { body: { result: 'updated' } };

      (elasticsearchService.update as jest.Mock).mockResolvedValue(mockUpdateResponse);

      const result = await filmsService.updateFilm(mockFilmId, updateFilmDto);

      expect(elasticsearchService.update).toHaveBeenCalledWith({
        index: 'films',
        id: mockFilmId,
        body: { doc: updateFilmDto }
      });
      expect(result).toEqual(mockUpdateResponse.body);
    });

    it('should throw an error if update fails', async () => {
      const mockFilmId = 'film123';
      const updateFilmDto = { title: 'Updated Film Title' };

      (elasticsearchService.update as jest.Mock).mockRejectedValue(new Error('Update failed'));

      await expect(filmsService.updateFilm(mockFilmId, updateFilmDto)).rejects.toThrow('Failed to update film: Update failed');
    });

    it('should handle partial updates correctly', async () => {
      const mockFilmId = 'film123';
      const updateFilmDto = { year: 2023 };
      const mockUpdateResponse = { body: { result: 'updated' } };

      (elasticsearchService.update as jest.Mock).mockResolvedValue(mockUpdateResponse);

      const result = await filmsService.updateFilm(mockFilmId, updateFilmDto);

      expect(elasticsearchService.update).toHaveBeenCalledWith({
        index: 'films',
        id: mockFilmId,
        body: { doc: updateFilmDto }
      });
      expect(result).toEqual(mockUpdateResponse.body);
    });
  });
});