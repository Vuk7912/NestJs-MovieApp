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

  const mockMovie = {
    _id: 'movie123',
    title: 'Test Movie',
    description: 'Test Description',
    genre: 'Action',
  };

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
    it('should update a movie and index in Elasticsearch', async () => {
      const updateDto: CreateMovieDto = {
        title: 'Updated Movie Title',
        description: 'Updated Description',
        genre: 'Drama',
      };

      // Mock the findByIdAndUpdate to return the updated movie
      mockMovieModel.findByIdAndUpdate.mockResolvedValue({
        ...mockMovie,
        ...updateDto,
      });

      const result = await movieService.updateMovieById('movie123', updateDto);

      // Verify model update method was called with correct parameters
      expect(mockMovieModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'movie123', 
        updateDto, 
        { new: true }
      );

      // Verify Elasticsearch update was called
      expect(mockElasticsearchService.updateFilm).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockMovie,
          ...updateDto,
        })
      );

      // Verify returned result matches expected
      expect(result).toEqual(expect.objectContaining(updateDto));
    });

    it('should handle update failure gracefully', async () => {
      const updateDto: CreateMovieDto = {
        title: 'Updated Movie Title',
        description: 'Updated Description',
        genre: 'Drama',
      };

      // Simulate findByIdAndUpdate returning null (no movie found)
      mockMovieModel.findByIdAndUpdate.mockResolvedValue(null);

      const result = await movieService.updateMovieById('invalidId', updateDto);

      // Verify model update method was called
      expect(mockMovieModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'invalidId', 
        updateDto, 
        { new: true }
      );

      // Verify Elasticsearch was not called
      expect(mockElasticsearchService.updateFilm).not.toHaveBeenCalled();

      // Verify null is returned when movie not found
      expect(result).toBeNull();
    });
  });
});