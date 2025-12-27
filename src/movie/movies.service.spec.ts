import { Test, TestingModule } from '@nestjs/testing';
import { MovieService } from './movies.service';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';
import { getModelToken } from '@nestjs/mongoose';
import { Movie } from './schemas/movie.schema';

describe('MovieService', () => {
  let movieService: MovieService;
  let elasticsearchService: ElasticsearchService;

  const mockElasticsearchService = {
    searchMovies: jest.fn(),
  };

  const mockMovieModel = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieService,
        {
          provide: getModelToken(Movie.name),
          useValue: mockMovieModel,
        },
        {
          provide: ElasticsearchService,
          useValue: mockElasticsearchService,
        },
      ],
    }).compile();

    movieService = module.get<MovieService>(MovieService);
    elasticsearchService = module.get<ElasticsearchService>(ElasticsearchService);
  });

  describe('searchMovies', () => {
    it('should call elasticsearch service with correct parameters', async () => {
      const mockSearchResults = [
        { id: '1', title: 'Test Movie', genre: 'Action' },
        { id: '2', title: 'Another Movie', genre: 'Action' },
      ];

      jest
        .spyOn(elasticsearchService, 'searchMovies')
        .mockResolvedValue(mockSearchResults);

      const result = await movieService.searchMovies('test', 'Action');

      expect(elasticsearchService.searchMovies).toHaveBeenCalledWith('test', 'Action');
      expect(result).toEqual(mockSearchResults);
    });

    it('should handle empty genre gracefully', async () => {
      const mockSearchResults = [
        { id: '1', title: 'Test Movie', genre: 'Action' },
      ];

      jest
        .spyOn(elasticsearchService, 'searchMovies')
        .mockResolvedValue(mockSearchResults);

      const result = await movieService.searchMovies('test', '');

      expect(elasticsearchService.searchMovies).toHaveBeenCalledWith('test', '');
      expect(result).toEqual(mockSearchResults);
    });

    it('should return empty array if no results found', async () => {
      jest
        .spyOn(elasticsearchService, 'searchMovies')
        .mockResolvedValue([]);

      const result = await movieService.searchMovies('nonexistent', 'Sci-Fi');

      expect(elasticsearchService.searchMovies).toHaveBeenCalledWith('nonexistent', 'Sci-Fi');
      expect(result).toEqual([]);
    });
  });
});