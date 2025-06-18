import { Test, TestingModule } from '@nestjs/testing';
import { MovieService } from './movies.service';
import { getModelToken } from '@nestjs/mongoose';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';
import { Movie } from './schemas/movie.schema';
import { Model } from 'mongoose';
import { CreateMovieDto } from './dto/create-movie.dto';

describe('MovieService', () => {
  let movieService: MovieService;
  let mockMovieModel: jest.Mocked<Model<Movie>>;
  let mockElasticsearchService: jest.Mocked<ElasticsearchService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieService,
        {
          provide: getModelToken(Movie.name),
          useValue: {
            findByIdAndUpdate: jest.fn(),
          },
        },
        {
          provide: ElasticsearchService,
          useValue: {
            updateFilm: jest.fn(),
          },
        },
      ],
    }).compile();

    movieService = module.get<MovieService>(MovieService);
    mockMovieModel = module.get(getModelToken(Movie.name));
    mockElasticsearchService = module.get(ElasticsearchService);
  });

  describe('updateMovieById', () => {
    it('should update a movie and sync with Elasticsearch', async () => {
      // Prepare test data
      const movieId = '60d5ecb8b3b3a83f2cf5e123';
      const updateMovieDto: CreateMovieDto = {
        title: 'Updated Movie Title',
        genre: 'Updated Genre',
        description: 'Updated Description',
      };

      const updatedMovie = {
        _id: movieId,
        ...updateMovieDto,
      };

      // Mock implementations
      mockMovieModel.findByIdAndUpdate.mockResolvedValue(updatedMovie);
      mockElasticsearchService.updateFilm.mockResolvedValue(true);

      // Execute method
      const result = await movieService.updateMovieById(movieId, updateMovieDto);

      // Assertions
      expect(mockMovieModel.findByIdAndUpdate).toHaveBeenCalledWith(
        movieId,
        updateMovieDto,
        { new: true }
      );
      expect(mockElasticsearchService.updateFilm).toHaveBeenCalledWith(updatedMovie);
      expect(result).toEqual(updatedMovie);
    });

    it('should return null if movie not found', async () => {
      // Prepare test data
      const movieId = '60d5ecb8b3b3a83f2cf5e123';
      const updateMovieDto: CreateMovieDto = {
        title: 'Updated Movie Title',
        genre: 'Updated Genre',
        description: 'Updated Description',
      };

      // Mock implementations
      mockMovieModel.findByIdAndUpdate.mockResolvedValue(null);

      // Execute method
      const result = await movieService.updateMovieById(movieId, updateMovieDto);

      // Assertions
      expect(mockMovieModel.findByIdAndUpdate).toHaveBeenCalledWith(
        movieId,
        updateMovieDto,
        { new: true }
      );
      expect(mockElasticsearchService.updateFilm).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
});