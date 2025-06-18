import { Test, TestingModule } from '@nestjs/testing';
import { MovieService } from './movies.service';
import { getModelToken } from '@nestjs/mongoose';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';
import { Movie } from './schemas/movie.schema';
import { CreateMovieDto } from './dto/create-movie.dto';

describe('MovieService', () => {
  let movieService: MovieService;
  let mockMovieModel: any;
  let mockElasticsearchService: any;

  const mockMovie = {
    _id: '507f1f77bcf86cd799439011',
    title: 'Original Movie',
    genre: 'Action',
    description: 'An original movie'
  };

  const mockUpdateMovie: CreateMovieDto = {
    title: 'Updated Movie',
    genre: 'Drama',
    description: 'An updated movie description'
  };

  beforeEach(async () => {
    mockMovieModel = {
      findByIdAndUpdate: jest.fn(),
    };

    mockElasticsearchService = {
      updateFilm: jest.fn(),
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
    it('should update a movie and sync with Elasticsearch', async () => {
      const updatedMovie = { ...mockMovie, ...mockUpdateMovie };
      
      mockMovieModel.findByIdAndUpdate.mockResolvedValue(updatedMovie);
      mockElasticsearchService.updateFilm.mockResolvedValue(true);

      const result = await movieService.updateMovieById(
        mockMovie._id, 
        mockUpdateMovie
      );

      expect(mockMovieModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockMovie._id, 
        mockUpdateMovie, 
        { new: true }
      );
      expect(mockElasticsearchService.updateFilm).toHaveBeenCalledWith(updatedMovie);
      expect(result).toEqual(updatedMovie);
    });

    it('should handle update when movie is not found', async () => {
      mockMovieModel.findByIdAndUpdate.mockResolvedValue(null);
      
      const result = await movieService.updateMovieById(
        mockMovie._id, 
        mockUpdateMovie
      );

      expect(mockMovieModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockMovie._id, 
        mockUpdateMovie, 
        { new: true }
      );
      expect(mockElasticsearchService.updateFilm).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
});