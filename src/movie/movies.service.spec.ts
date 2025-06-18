import { Test, TestingModule } from '@nestjs/testing';
import { MovieService } from './movies.service';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';
import { getModelToken } from '@nestjs/mongoose';
import { Movie } from './schemas/movie.schema';
import { CreateMovieDto } from './dto/create-movie.dto';
import { Model, Types } from 'mongoose';

describe('MovieService', () => {
  let movieService: MovieService;
  let mockMovieModel: Partial<Model<Movie>>;
  let mockElasticsearchService: Partial<ElasticsearchService>;

  beforeEach(async () => {
    const mockMovie = {
      _id: new Types.ObjectId(),
      title: 'Test Movie',
      description: 'Test Description',
      genre: 'Action',
      ratings: [],
      comments: []
    };

    mockMovieModel = {
      findByIdAndUpdate: jest.fn().mockResolvedValue(mockMovie)
    };

    mockElasticsearchService = {
      updateFilm: jest.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieService,
        {
          provide: getModelToken(Movie.name),
          useValue: mockMovieModel
        },
        {
          provide: ElasticsearchService,
          useValue: mockElasticsearchService
        }
      ]
    }).compile();

    movieService = module.get<MovieService>(MovieService);
  });

  describe('updateMovieById', () => {
    it('should update a movie in MongoDB and Elasticsearch', async () => {
      const movieId = new Types.ObjectId().toString();
      const updateMovieDto: CreateMovieDto = {
        title: 'Updated Movie',
        description: 'Updated Description',
        genre: 'Sci-Fi'
      };

      const result = await movieService.updateMovieById(movieId, updateMovieDto);

      expect(mockMovieModel.findByIdAndUpdate).toHaveBeenCalledWith(
        movieId, 
        updateMovieDto, 
        { new: true }
      );
      expect(mockElasticsearchService.updateFilm).toHaveBeenCalledWith(result);
      expect(result.title).toBe('Test Movie');
    });

    it('should handle null movie update gracefully', async () => {
      const movieId = new Types.ObjectId().toString();
      const updateMovieDto: CreateMovieDto = {
        title: 'Updated Movie',
        description: 'Updated Description',
        genre: 'Sci-Fi'
      };

      mockMovieModel.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

      const result = await movieService.updateMovieById(movieId, updateMovieDto);

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