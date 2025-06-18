import { Test, TestingModule } from '@nestjs/testing';
import { MovieService } from './movies.service';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';
import { getModelToken } from '@nestjs/mongoose';
import { Movie } from './schemas/movie.schema';
import { Model } from 'mongoose';

describe('MovieService', () => {
  let service: MovieService;
  let elasticsearchService: ElasticsearchService;
  let movieModel: Model<Movie>;

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

    service = module.get<MovieService>(MovieService);
    elasticsearchService = module.get<ElasticsearchService>(ElasticsearchService);
    movieModel = module.get<Model<Movie>>(getModelToken(Movie.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('searchMovies', () => {
    it('should call elasticsearch service with correct parameters', async () => {
      const query = 'Batman';
      const genre = 'Action';
      const mockResult = [{ id: '1', title: 'Batman Begins' }];

      jest.spyOn(elasticsearchService, 'searchMovies').mockResolvedValue(mockResult);

      const result = await service.searchMovies(query, genre);

      expect(elasticsearchService.searchMovies).toHaveBeenCalledWith(query, genre);
      expect(result).toEqual(mockResult);
    });

    it('should handle empty genre', async () => {
      const query = 'Inception';
      const mockResult = [{ id: '2', title: 'Inception' }];

      jest.spyOn(elasticsearchService, 'searchMovies').mockResolvedValue(mockResult);

      const result = await service.searchMovies(query, '');

      expect(elasticsearchService.searchMovies).toHaveBeenCalledWith(query, '');
      expect(result).toEqual(mockResult);
    });

    it('should handle empty query and genre', async () => {
      const mockResult = [];

      jest.spyOn(elasticsearchService, 'searchMovies').mockResolvedValue(mockResult);

      const result = await service.searchMovies('', '');

      expect(elasticsearchService.searchMovies).toHaveBeenCalledWith('', '');
      expect(result).toEqual(mockResult);
    });
  });
});