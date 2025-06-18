import { Test, TestingModule } from '@nestjs/testing';
import { MovieService } from './movies.service';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';
import { getModelToken } from '@nestjs/mongoose';
import { Movie } from './schemas/movie.schema';

describe('MovieService - searchMovies', () => {
  let movieService: MovieService;
  let elasticsearchService: ElasticsearchService;

  // Mock dependencies
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should search movies with query and genre', async () => {
    const mockSearchResult = [
      { id: '1', title: 'Test Movie', genre: 'Action' },
      { id: '2', title: 'Another Test Movie', genre: 'Action' },
    ];

    mockElasticsearchService.searchMovies.mockResolvedValue(mockSearchResult);

    const result = await movieService.searchMovies('test', 'Action');

    expect(result).toEqual(mockSearchResult);
    expect(elasticsearchService.searchMovies).toHaveBeenCalledWith('test', 'Action');
  });

  it('should search movies with only query', async () => {
    const mockSearchResult = [
      { id: '1', title: 'Test Movie' },
    ];

    mockElasticsearchService.searchMovies.mockResolvedValue(mockSearchResult);

    const result = await movieService.searchMovies('test', '');

    expect(result).toEqual(mockSearchResult);
    expect(elasticsearchService.searchMovies).toHaveBeenCalledWith('test', '');
  });

  it('should handle empty query gracefully', async () => {
    const mockSearchResult = [];

    mockElasticsearchService.searchMovies.mockResolvedValue(mockSearchResult);

    const result = await movieService.searchMovies('', '');

    expect(result).toEqual(mockSearchResult);
    expect(elasticsearchService.searchMovies).toHaveBeenCalledWith('', '');
  });
});