import { Test, TestingModule } from '@nestjs/testing';
import { MovieService } from './movies.service';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';
import { getModelToken } from '@nestjs/mongoose';
import { Movie } from './schemas/movie.schema';
import { CreateMovieDto } from './dto/create-movie.dto';

describe('MovieService', () => {
  let movieService: MovieService;
  let mockMovieModel: any;
  let mockElasticsearchService: any;

  const mockMovie = {
    _id: 'movie123',
    title: 'Test Movie',
    genre: 'Action',
    description: 'Test Description',
  };

  const createMovieDto: CreateMovieDto = {
    title: 'Test Movie',
    genre: 'Action',
    description: 'Test Description',
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
          useValue: mockMovieModel,
        },
        {
          provide: ElasticsearchService,
          useValue: mockElasticsearchService,
        },
      ],
    }).compile();

    movieService = module.get<MovieService>(MovieService);
  });

  describe('updateMovieById', () => {
    it('should update a movie and index in Elasticsearch', async () => {
      // Arrange
      mockMovieModel.findByIdAndUpdate.mockResolvedValue(mockMovie);
      mockElasticsearchService.updateFilm.mockResolvedValue(true);

      // Act
      const result = await movieService.updateMovieById('movie123', createMovieDto);

      // Assert
      expect(mockMovieModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'movie123', 
        createMovieDto, 
        { new: true }
      );
      expect(mockElasticsearchService.updateFilm).toHaveBeenCalledWith(mockMovie);
      expect(result).toEqual(mockMovie);
    });

    it('should return null if movie not found', async () => {
      // Arrange
      mockMovieModel.findByIdAndUpdate.mockResolvedValue(null);

      // Act
      const result = await movieService.updateMovieById('nonexistentId', createMovieDto);

      // Assert
      expect(mockMovieModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'nonexistentId', 
        createMovieDto, 
        { new: true }
      );
      expect(mockElasticsearchService.updateFilm).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should handle Elasticsearch update error gracefully', async () => {
      // Arrange
      mockMovieModel.findByIdAndUpdate.mockResolvedValue(mockMovie);
      mockElasticsearchService.updateFilm.mockRejectedValue(new Error('Elasticsearch error'));

      // Act & Assert
      await expect(movieService.updateMovieById('movie123', createMovieDto)).rejects.toThrow('Elasticsearch error');
    });
  });
});