import { Test } from '@nestjs/testing';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { FilmsService } from './films.service';

describe('FilmsService', () => {
  let filmsService: FilmsService;
  let elasticsearchService: ElasticsearchService;

  beforeEach(async () => {
    const mockElasticsearchService = {
      update: jest.fn()
    };

    const module = await Test.createTestingModule({
      providers: [
        FilmsService,
        {
          provide: ElasticsearchService,
          useValue: mockElasticsearchService
        }
      ]
    }).compile();

    filmsService = module.get(FilmsService);
    elasticsearchService = module.get(ElasticsearchService);
  });

  describe('updateFilm', () => {
    it('should successfully update a film', async () => {
      const mockFilmId = 'film123';
      const updateFilmDto = { title: 'Updated Film Title', year: 2023 };
      const mockUpdateResponse = { body: { result: 'updated' } };

      jest.spyOn(elasticsearchService, 'update').mockResolvedValue(mockUpdateResponse as any);

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

      jest.spyOn(elasticsearchService, 'update').mockRejectedValue(new Error('Update failed'));

      await expect(filmsService.updateFilm(mockFilmId, updateFilmDto)).rejects.toThrow('Failed to update film: Update failed');
    });

    it('should handle partial updates correctly', async () => {
      const mockFilmId = 'film123';
      const updateFilmDto = { year: 2023 };
      const mockUpdateResponse = { body: { result: 'updated' } };

      jest.spyOn(elasticsearchService, 'update').mockResolvedValue(mockUpdateResponse as any);

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