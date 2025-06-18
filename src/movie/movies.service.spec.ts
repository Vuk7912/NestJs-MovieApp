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
    it('should call elasticsearch search method with correct parameters', async () => {
      const mockSearchResult = [{ id: '1', title: 'Test Movie' }];
      (elasticsearchService.searchMovies as jest.Mock).mockResolvedValue(mockSearchResult);

      const query = 'action';
      const genre = 'Action';
      const result = await movieService.searchMovies(query, genre);

      expect(elasticsearchService.searchMovies).toHaveBeenCalledWith(query, genre);
      expect(result).toEqual(mockSearchResult);
    });

    it('should call elasticsearch search method with empty genre', async () => {
      const mockSearchResult = [{ id: '1', title: 'Test Movie' }];
      (elasticsearchService.searchMovies as jest.Mock).mockResolvedValue(mockSearchResult);

      const query = 'drama';
      const result = await movieService.searchMovies(query, '');

      expect(elasticsearchService.searchMovies).toHaveBeenCalledWith(query, '');
      expect(result).toEqual(mockSearchResult);
    });

    it('should handle empty search query', async () => {
      const mockSearchResult = [];
      (elasticsearchService.searchMovies as jest.Mock).mockResolvedValue(mockSearchResult);

      const result = await movieService.searchMovies('', '');

      expect(elasticsearchService.searchMovies).toHaveBeenCalledWith('', '');
      expect(result).toEqual(mockSearchResult);
    });
  });
});