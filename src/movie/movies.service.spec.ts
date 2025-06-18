import { Test, TestingModule } from '@nestjs/nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { MovieService } from './movies.service';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';
import { Movie } from './schemas/movie.schema';
import { CreateMovieDto } from './dto/create-movie.dto';
import { Model, Types } from 'mongoose';

describe('MovieService - updateMovieById', () => {
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

  it('should update a movie successfully', async () => {
    const movieId = new Types.ObjectId().toString();
    const updateMovieDto: CreateMovieDto = {
      title: 'Updated Movie',
      description: 'Updated description',
      genre: ['Drama'],
      year: 2023,
    };

    const updatedMovie = {
      _id: movieId,
      ...updateMovieDto,
    };

    mockMovieModel.findByIdAndUpdate.mockResolvedValue(updatedMovie);
    mockElasticsearchService.updateFilm.mockResolvedValue(null);

    const result = await movieService.updateMovieById(movieId, updateMovieDto);

    expect(mockMovieModel.findByIdAndUpdate).toHaveBeenCalledWith(
      movieId,
      updateMovieDto,
      { new: true }
    );
    expect(mockElasticsearchService.updateFilm).toHaveBeenCalledWith(updatedMovie);
    expect(result).toEqual(updatedMovie);
  });

  it('should handle update with no changes', async () => {
    const movieId = new Types.ObjectId().toString();
    const updateMovieDto: CreateMovieDto = {};

    mockMovieModel.findByIdAndUpdate.mockResolvedValue(null);

    const result = await movieService.updateMovieById(movieId, updateMovieDto);

    expect(mockMovieModel.findByIdAndUpdate).toHaveBeenCalledWith(
      movieId,
      updateMovieDto,
      { new: true }
    );
    expect(mockElasticsearchService.updateFilm).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('should handle Elasticsearch update error gracefully', async () => {
    const movieId = new Types.ObjectId().toString();
    const updateMovieDto: CreateMovieDto = {
      title: 'Updated Movie',
    };

    const updatedMovie = {
      _id: movieId,
      ...updateMovieDto,
    };

    mockMovieModel.findByIdAndUpdate.mockResolvedValue(updatedMovie);
    mockElasticsearchService.updateFilm.mockRejectedValue(new Error('ES Update Failed'));

    const result = await movieService.updateMovieById(movieId, updateMovieDto);

    expect(mockMovieModel.findByIdAndUpdate).toHaveBeenCalledWith(
      movieId,
      updateMovieDto,
      { new: true }
    );
    expect(mockElasticsearchService.updateFilm).toHaveBeenCalledWith(updatedMovie);
    expect(result).toEqual(updatedMovie);
  });
});