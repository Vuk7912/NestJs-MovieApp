import { Test, TestingModule } from '@nestjs/nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MovieService } from './movies.service';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';
import { Movie } from './schemas/movie.schema';
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
    it('should update a movie and index in elasticsearch', async () => {
      const movieId = '123';
      const updateMovieDto: CreateMovieDto = {
        title: 'Updated Movie',
        genre: 'Drama',
        description: 'Updated description',
        year: 2023,
      };

      const updatedMovie = {
        _id: movieId,
        ...updateMovieDto,
      } as Movie;

      mockMovieModel.findByIdAndUpdate.mockResolvedValue(updatedMovie);
      mockElasticsearchService.updateFilm.mockResolvedValue(undefined);

      const result = await movieService.updateMovieById(movieId, updateMovieDto);

      expect(mockMovieModel.findByIdAndUpdate).toHaveBeenCalledWith(
        movieId,
        updateMovieDto,
        { new: true }
      );
      expect(mockElasticsearchService.updateFilm).toHaveBeenCalledWith(updatedMovie);
      expect(result).toEqual(updatedMovie);
    });

    it('should return null if movie is not found', async () => {
      const movieId = '123';
      const updateMovieDto: CreateMovieDto = {
        title: 'Updated Movie',
        genre: 'Drama',
        description: 'Updated description',
        year: 2023,
      };

      mockMovieModel.findByIdAndUpdate.mockResolvedValue(null);

      const result = await movieService.updateMovieById(movieId, updateMovieDto);

      expect(result).toBeNull();
      expect(mockElasticsearchService.updateFilm).not.toHaveBeenCalled();
    });
  });
});