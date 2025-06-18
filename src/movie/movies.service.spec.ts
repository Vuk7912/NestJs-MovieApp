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

  const mockMovieModel = {
    // Add any necessary mock methods
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieService,
        {
          provide: ElasticsearchService,
          useValue: mockElasticsearchService,
        },
        {
          provide: getModelToken(Movie.name),
          useValue: mockMovieModel,
        },
      ],
    }).compile();

    movieService = module.get<MovieService>(MovieService);
    elasticsearchService = module.get<ElasticsearchService>(ElasticsearchService);
  });

  describe('searchMovies', () => {
    it('should call elasticsearch search with correct parameters', async () => {
      const mockSearchResults = [
        { id: '1', title: 'Test Movie', genre: 'Action' },
        { id: '2', title: 'Another Test Movie', genre: 'Action' },
      ];

      mockElasticsearchService.searchMovies.mockResolvedValue(mockSearchResults);

      const result = await movieService.searchMovies('test', 'Action');

      expect(elasticsearchService.searchMovies).toHaveBeenCalledWith('test', 'Action');
      expect(result).toEqual(mockSearchResults);
    });

    it('should handle empty genre by passing empty string', async () => {
      const mockSearchResults = [
        { id: '1', title: 'Test Movie', genre: 'Action' },
      ];

      mockElasticsearchService.searchMovies.mockResolvedValue(mockSearchResults);

      const result = await movieService.searchMovies('test', '');

      expect(elasticsearchService.searchMovies).toHaveBeenCalledWith('test', '');
      expect(result).toEqual(mockSearchResults);
    });

    it('should handle undefined genre', async () => {
      const mockSearchResults = [
        { id: '1', title: 'Test Movie', genre: 'Action' },
      ];

      mockElasticsearchService.searchMovies.mockResolvedValue(mockSearchResults);

      const result = await movieService.searchMovies('test', undefined);

      expect(elasticsearchService.searchMovies).toHaveBeenCalledWith('test', '');
      expect(result).toEqual(mockSearchResults);
    });

    it('should handle edge case of empty query', async () => {
      const mockSearchResults = [];

      mockElasticsearchService.searchMovies.mockResolvedValue(mockSearchResults);

      const result = await movieService.searchMovies('', 'Action');

      expect(elasticsearchService.searchMovies).toHaveBeenCalledWith('', 'Action');
      expect(result).toEqual([]);
    });
  });
});