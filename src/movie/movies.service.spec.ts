import { Test, TestingModule } from '@nestjs/testing';
import { MovieService } from './movies.service';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';
import { getModelToken } from '@nestjs/mongoose';
import { Movie } from './schemas/movie.schema';
import { Model } from 'mongoose';

describe('MovieService', () => {
  let movieService: MovieService;
  let elasticsearchService: ElasticsearchService;

  const mockElasticsearchService = {
    searchMovies: jest.fn(),
  };

  const mockMovieModel = {} as Model<Movie>;

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
    it('should call elasticsearch searchMovies with correct parameters', async () => {
      const mockSearchResult = [{ id: '1', title: 'Test Movie' }];
      const query = 'test';
      const genre = 'action';

      jest.spyOn(elasticsearchService, 'searchMovies').mockResolvedValue(mockSearchResult);

      const result = await movieService.searchMovies(query, genre);

      expect(elasticsearchService.searchMovies).toHaveBeenCalledWith(query, genre);
      expect(result).toEqual(mockSearchResult);
    });

    it('should call elasticsearch searchMovies with empty genre when not provided', async () => {
      const mockSearchResult = [{ id: '1', title: 'Test Movie' }];
      const query = 'test';

      jest.spyOn(elasticsearchService, 'searchMovies').mockResolvedValue(mockSearchResult);

      const result = await movieService.searchMovies(query, '');

      expect(elasticsearchService.searchMovies).toHaveBeenCalledWith(query, '');
      expect(result).toEqual(mockSearchResult);
    });

    it('should handle empty query and genre', async () => {
      const mockSearchResult = [];

      jest.spyOn(elasticsearchService, 'searchMovies').mockResolvedValue(mockSearchResult);

      const result = await movieService.searchMovies('', '');

      expect(elasticsearchService.searchMovies).toHaveBeenCalledWith('', '');
      expect(result).toEqual(mockSearchResult);
    });
  });
});