import { Test, TestingModule } from '@nestjs/testing';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { MovieService } from '../movie.service';
import { expect, describe, it, beforeEach, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';

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
  let elasticsearchService: {
    update: jest.Mock;
    get: jest.Mock;
  };

  beforeEach(async () => {
    const mockElasticsearchService = {
      update: vi.fn(),
      get: vi.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieService,
        {
          provide: ElasticsearchService,
          useValue: mockElasticsearchService
        }
      ]
    }).compile();

    movieService = module.get<MovieService>(MovieService);
    elasticsearchService = module.get(ElasticsearchService);
  });

  it('should successfully update a movie', async () => {
    const mockGetResponse = {
      _source: {
        id: mockMovieId,
        title: 'Original Movie',
        description: 'Original description',
        year: 2022,
        genres: ['Action']
      }
    };

    const mockUpdateResponse = {
      _index: 'movies',
      _id: mockMovieId,
      _version: 2,
      result: 'updated'
    };

    elasticsearchService.get.mockResolvedValue(mockGetResponse);
    elasticsearchService.update.mockResolvedValue(mockUpdateResponse);

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

  it('should throw a NotFoundException if movie is not found', async () => {
    elasticsearchService.get.mockRejectedValue(new Error('index_not_found_exception'));

    await expect(
      movieService.updateFilm(mockMovieId, mockUpdateMovieDto)
    ).rejects.toThrow(NotFoundException);
  });

  it('should handle partial updates', async () => {
    const partialUpdateDto = { title: 'Partially Updated Title' };

    const mockGetResponse = {
      _source: {
        id: mockMovieId,
        title: 'Original Movie',
        description: 'Original description',
        year: 2022,
        genres: ['Action']
      }
    };

    const mockUpdateResponse = {
      _index: 'movies',
      _id: mockMovieId,
      _version: 2,
      result: 'updated'
    };

    elasticsearchService.get.mockResolvedValue(mockGetResponse);
    elasticsearchService.update.mockResolvedValue(mockUpdateResponse);

    const result = await movieService.updateFilm(mockMovieId, partialUpdateDto);

    expect(result.title).toBe(partialUpdateDto.title);
    expect(elasticsearchService.update).toHaveBeenCalledWith({
      index: 'movies',
      id: mockMovieId,
      doc: partialUpdateDto
    });
  });

  it('should handle error during update', async () => {
    const mockGetResponse = {
      _source: {
        id: mockMovieId,
        title: 'Original Movie',
        description: 'Original description',
        year: 2022,
        genres: ['Action']
      }
    };

    elasticsearchService.get.mockResolvedValue(mockGetResponse);
    elasticsearchService.update.mockRejectedValue(new Error('Unexpected error'));

    await expect(
      movieService.updateFilm(mockMovieId, mockUpdateMovieDto)
    ).rejects.toThrow('Unexpected error');
  });
});