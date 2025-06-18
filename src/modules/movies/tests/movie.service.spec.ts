import { Test, TestingModule } from '@nestjs/testing';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { MovieService } from '../movie.service';
import { expect, describe, it, beforeEach, vi } from 'vitest';

// Mock movie update data
const mockMovieId = '123';
const mockUpdateMovieDto = {
  title: 'Updated Movie Title',
  description: 'Updated movie description',
  year: 2023,
  genres: ['Drama', 'Thriller']
};

describe('MovieService - updateFilm', () => {
  let movieService: MovieService;
  let elasticsearchService: ElasticsearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieService,
        {
          provide: ElasticsearchService,
          useValue: {
            update: vi.fn(),
            get: vi.fn().mockResolvedValue({
              _source: {
                id: mockMovieId,
                title: 'Original Movie',
                description: 'Original description',
                year: 2022,
                genres: ['Action']
              }
            })
          }
        }
      ]
    }).compile();

    movieService = module.get<MovieService>(MovieService);
    elasticsearchService = module.get<ElasticsearchService>(ElasticsearchService);
  });

  it('should successfully update a movie', async () => {
    const mockElasticsearchResponse = {
      _index: 'movies',
      _id: mockMovieId,
      _version: 2,
      result: 'updated'
    };

    vi.spyOn(elasticsearchService, 'update').mockResolvedValue(mockElasticsearchResponse);

    const result = await movieService.updateFilm(mockMovieId, mockUpdateMovieDto);

    expect(result).toEqual({
      id: mockMovieId,
      ...mockUpdateMovieDto
    });

    expect(elasticsearchService.update).toHaveBeenCalledWith({
      index: 'movies',
      id: mockMovieId,
      doc: mockUpdateMovieDto
    });
  });

  it('should throw an error if movie is not found', async () => {
    vi.spyOn(elasticsearchService, 'get').mockRejectedValue(new Error('Movie not found'));

    await expect(
      movieService.updateFilm(mockMovieId, mockUpdateMovieDto)
    ).rejects.toThrow('Movie not found');
  });

  it('should handle partial updates', async () => {
    const partialUpdateDto = { title: 'Partially Updated Title' };

    const mockElasticsearchResponse = {
      _index: 'movies',
      _id: mockMovieId,
      _version: 2,
      result: 'updated'
    };

    vi.spyOn(elasticsearchService, 'update').mockResolvedValue(mockElasticsearchResponse);

    const result = await movieService.updateFilm(mockMovieId, partialUpdateDto);

    expect(result.title).toBe(partialUpdateDto.title);
    expect(elasticsearchService.update).toHaveBeenCalledWith({
      index: 'movies',
      id: mockMovieId,
      doc: partialUpdateDto
    });
  });

  it('should handle error during update', async () => {
    vi.spyOn(elasticsearchService, 'update').mockRejectedValue(new Error('Update failed'));

    await expect(
      movieService.updateFilm(mockMovieId, mockUpdateMovieDto)
    ).rejects.toThrow('Update failed');
  });
});