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
    // Add any necessary mock methods if required
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
    it('should call elasticsearch service with query and genre', async () => {
      const mockSearchResult = [{ id: '1', title: 'Test Movie' }];
      jest.spyOn(elasticsearchService, 'searchMovies').mockResolvedValue(mockSearchResult);

      const result = await movieService.searchMovies('test', 'action');
      
      expect(elasticsearchService.searchMovies).toHaveBeenCalledWith('test', 'action');
      expect(result).toEqual(mockSearchResult);
    });

    it('should call elasticsearch service with empty genre when no genre is provided', async () => {
      const mockSearchResult = [{ id: '1', title: 'Test Movie' }];
      jest.spyOn(elasticsearchService, 'searchMovies').mockResolvedValue(mockSearchResult);

      const result = await movieService.searchMovies('test', '');
      
      expect(elasticsearchService.searchMovies).toHaveBeenCalledWith('test', '');
      expect(result).toEqual(mockSearchResult);
    });

    it('should return empty array when no results found', async () => {
      jest.spyOn(elasticsearchService, 'searchMovies').mockResolvedValue([]);

      const result = await movieService.searchMovies('nonexistent', '');
      
      expect(result).toEqual([]);
    });
  });
});