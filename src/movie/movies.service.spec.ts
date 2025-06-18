import { Test, TestingModule } from '@nestjs/testing';
import { MovieService } from './movies.service';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';
import { getModelToken } from '@nestjs/mongoose';
import { Movie } from './schemas/movie.schema';

describe('MovieService - searchMovies', () => {
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

  it('should call elasticsearch service with query and genre', async () => {
    const mockSearchResult = [{ id: '1', title: 'Test Movie' }];
    jest.spyOn(elasticsearchService, 'searchMovies').mockResolvedValue(mockSearchResult);

    const result = await movieService.searchMovies('action', 'thriller');

    expect(elasticsearchService.searchMovies).toHaveBeenCalledWith('action', 'thriller');
    expect(result).toEqual(mockSearchResult);
  });

  it('should call elasticsearch service with empty genre string', async () => {
    const mockSearchResult = [{ id: '1', title: 'Test Movie' }];
    jest.spyOn(elasticsearchService, 'searchMovies').mockResolvedValue(mockSearchResult);

    const result = await movieService.searchMovies('action', '');

    expect(elasticsearchService.searchMovies).toHaveBeenCalledWith('action', '');
    expect(result).toEqual(mockSearchResult);
  });

  it('should handle empty query', async () => {
    const mockSearchResult = [];
    jest.spyOn(elasticsearchService, 'searchMovies').mockResolvedValue(mockSearchResult);

    const result = await movieService.searchMovies('', 'comedy');

    expect(elasticsearchService.searchMovies).toHaveBeenCalledWith('', 'comedy');
    expect(result).toEqual(mockSearchResult);
  });

  it('should handle no results', async () => {
    const mockSearchResult = [];
    jest.spyOn(elasticsearchService, 'searchMovies').mockResolvedValue(mockSearchResult);

    const result = await movieService.searchMovies('nonexistent', 'scifi');

    expect(elasticsearchService.searchMovies).toHaveBeenCalledWith('nonexistent', 'scifi');
    expect(result).toEqual([]);
  });
});