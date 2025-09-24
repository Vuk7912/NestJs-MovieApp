import { Test, TestingModule } from '@nestjs/testing';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { MovieService } from '../movie.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateFilmDto } from '../dto/update-film.dto';
import { Film } from '../interfaces/film.interface';

describe('MovieService - updateFilm', () => {
  let movieService: MovieService;
  let elasticsearchService: ElasticsearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieService,
        {
          provide: ElasticsearchService,
          useValue: {
            update: jest.fn(),
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    movieService = module.get<MovieService>(MovieService);
    elasticsearchService = module.get<ElasticsearchService>(ElasticsearchService);
  });

  describe('updateFilm', () => {
    const mockFilmId = 'film123';
    const mockUpdateFilmDto: UpdateFilmDto = {
      title: 'Updated Film Title',
      year: 2023,
      genre: ['Drama'],
    };

    const mockExistingFilm: Film = {
      id: mockFilmId,
      title: 'Original Film',
      year: 2022,
      genre: ['Action'],
      description: 'Test film',
    };

    it('should successfully update a film', async () => {
      // Mock Elasticsearch get to return existing film
      jest.spyOn(elasticsearchService, 'get').mockResolvedValue({
        _source: mockExistingFilm,
      } as any);

      // Mock Elasticsearch update to return success
      jest.spyOn(elasticsearchService, 'update').mockResolvedValue({} as any);

      const result = await movieService.updateFilm(mockFilmId, mockUpdateFilmDto);

      expect(result).toEqual({
        ...mockExistingFilm,
        ...mockUpdateFilmDto,
      });

      expect(elasticsearchService.get).toHaveBeenCalledWith({
        index: 'films',
        id: mockFilmId,
      });

      expect(elasticsearchService.update).toHaveBeenCalledWith({
        index: 'films',
        id: mockFilmId,
        body: {
          doc: mockUpdateFilmDto,
        },
      });
    });

    it('should throw NotFoundException if film does not exist', async () => {
      // Mock Elasticsearch get to throw not found error
      jest.spyOn(elasticsearchService, 'get').mockRejectedValue(new Error('Not Found'));

      await expect(movieService.updateFilm(mockFilmId, mockUpdateFilmDto))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid update data', async () => {
      // Mock Elasticsearch get to return existing film
      jest.spyOn(elasticsearchService, 'get').mockResolvedValue({
        _source: mockExistingFilm,
      } as any);

      const invalidUpdateDto = {
        title: '', // Empty title is invalid
      };

      await expect(movieService.updateFilm(mockFilmId, invalidUpdateDto as UpdateFilmDto))
        .rejects.toThrow(BadRequestException);
    });

    it('should handle partial updates correctly', async () => {
      // Mock Elasticsearch get to return existing film
      jest.spyOn(elasticsearchService, 'get').mockResolvedValue({
        _source: mockExistingFilm,
      } as any);

      // Mock Elasticsearch update to return success
      jest.spyOn(elasticsearchService, 'update').mockResolvedValue({} as any);

      const partialUpdateDto = {
        year: 2024,
      };

      const result = await movieService.updateFilm(mockFilmId, partialUpdateDto);

      expect(result).toEqual({
        ...mockExistingFilm,
        ...partialUpdateDto,
      });
    });
  });
});