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
    find: jest.fn(),
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
    it('should return movies matching the query', async () => {
      const mockSearchResult = [
        { id: '1', title: 'Test Movie', genre: 'Action' },
        { id: '2', title: 'Another Test Movie', genre: 'Action' }
      ];

      jest.spyOn(elasticsearchService, 'searchMovies').mockResolvedValue(mockSearchResult);

      const result = await movieService.searchMovies('test', 'Action');
      
      expect(result).toEqual(mockSearchResult);
      expect(elasticsearchService.searchMovies).toHaveBeenCalledWith('test', 'Action');
    });

    it('should handle empty genre gracefully', async () => {
      const mockSearchResult = [
        { id: '1', title: 'Test Movie', genre: 'Action' }
      ];

      jest.spyOn(elasticsearchService, 'searchMovies').mockResolvedValue(mockSearchResult);

      const result = await movieService.searchMovies('test', '');
      
      expect(result).toEqual(mockSearchResult);
      expect(elasticsearchService.searchMovies).toHaveBeenCalledWith('test', '');
    });

    it('should return an empty array when no results found', async () => {
      jest.spyOn(elasticsearchService, 'searchMovies').mockResolvedValue([]);

      const result = await movieService.searchMovies('nonexistent', 'Fantasy');
      
      expect(result).toEqual([]);
      expect(elasticsearchService.searchMovies).toHaveBeenCalledWith('nonexistent', 'Fantasy');
    });
  });
});