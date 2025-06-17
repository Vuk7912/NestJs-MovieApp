import { Test, TestingModule } from '@nestjs/testing';
import { MovieService } from './movies.service';
import { getModelToken } from '@nestjs/mongoose';
import { Movie } from './schemas/movie.schema';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';
import { CreateMovieDto } from './dto/create-movie.dto';

describe('MovieService', () => {
  let movieService: MovieService;
  let mockMovieModel;
  let mockElasticsearchService;

  const mockMovie = {
    _id: 'test-movie-id',
    title: 'Original Title',
    description: 'Original Description',
    genre: 'Original Genre',
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
      const updateDto: CreateMovieDto = {
        title: 'Updated Title',
        description: 'Updated Description',
        genre: 'Updated Genre',
      };

      const updatedMovie = { ...mockMovie, ...updateDto };

      mockMovieModel.findByIdAndUpdate.mockResolvedValue(updatedMovie);
      mockElasticsearchService.updateFilm.mockResolvedValue(null);

      const result = await movieService.updateMovieById('test-movie-id', updateDto);

      expect(mockMovieModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'test-movie-id', 
        updateDto, 
        { new: true }
      );
      expect(mockElasticsearchService.updateFilm).toHaveBeenCalledWith(updatedMovie);
      expect(result).toEqual(updatedMovie);
    });

    it('should return null if movie is not found', async () => {
      const updateDto: CreateMovieDto = {
        title: 'Updated Title',
        description: 'Updated Description',
        genre: 'Updated Genre',
      };

      mockMovieModel.findByIdAndUpdate.mockResolvedValue(null);

      const result = await movieService.updateMovieById('non-existent-id', updateDto);

      expect(result).toBeNull();
      expect(mockElasticsearchService.updateFilm).not.toHaveBeenCalled();
    });
  });
});