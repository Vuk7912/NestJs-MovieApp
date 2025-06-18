import { Test, TestingModule } from '@nestjs/testing';
import { MovieService } from './movies.service';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Movie } from './schemas/movie.schema';

describe('MovieService', () => {
  let movieService: MovieService;
  let elasticsearchService: ElasticsearchService;
  let mockMovieModel: Model<Movie>;

  const mockElasticsearchService = {
    searchMovies: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieService,
        {
          provide: getModelToken(Movie.name),
          useValue: {
            // Mock any Mongoose model methods used in the service
          },
        },
        {
          provide: ElasticsearchService,
          useValue: mockElasticsearchService,
        },
      ],
    }).compile();

    movieService = module.get<MovieService>(MovieService);
    elasticsearchService = module.get<ElasticsearchService>(ElasticsearchService);
    mockMovieModel = module.get<Model<Movie>>(getModelToken(Movie.name));
  });

  it('should be defined', () => {
    expect(movieService).toBeDefined();
  });

  describe('searchMovies', () => {
    it('should call elasticsearch service with correct parameters', async () => {
      const mockSearchResults = [
        { id: '1', title: 'Test Movie', genre: 'Action' },
        { id: '2', title: 'Another Test Movie', genre: 'Action' },
      ];

      // Mock the elasticsearch search method
      mockElasticsearchService.searchMovies.mockResolvedValue(mockSearchResults);

      const query = 'test';
      const genre = 'Action';
      const result = await movieService.searchMovies(query, genre);

      // Verify elasticsearch service was called with correct parameters
      expect(elasticsearchService.searchMovies).toHaveBeenCalledWith(query, genre);
      expect(result).toEqual(mockSearchResults);
    });

    it('should handle empty genre gracefully', async () => {
      const mockSearchResults = [
        { id: '1', title: 'Test Movie', genre: 'Action' },
      ];

      mockElasticsearchService.searchMovies.mockResolvedValue(mockSearchResults);

      const query = 'test';
      const result = await movieService.searchMovies(query, '');

      expect(elasticsearchService.searchMovies).toHaveBeenCalledWith(query, '');
      expect(result).toEqual(mockSearchResults);
    });

    it('should return empty array when no results found', async () => {
      mockElasticsearchService.searchMovies.mockResolvedValue([]);

      const query = 'nonexistent';
      const result = await movieService.searchMovies(query, '');

      expect(elasticsearchService.searchMovies).toHaveBeenCalledWith(query, '');
      expect(result).toEqual([]);
    });
  });
});