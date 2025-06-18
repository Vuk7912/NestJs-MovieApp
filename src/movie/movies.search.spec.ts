import { vi, describe, it, expect } from 'vitest';
import { MovieService } from './movies.service';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';
import { Movie } from './schemas/movie.schema';
import { Model } from 'mongoose';

describe('MovieService - Search Functionality', () => {
  // Mock data
  const mockMovies: Partial<Movie>[] = [
    {
      _id: '1',
      title: 'Inception',
      genre: ['Sci-Fi', 'Action'],
      description: 'A mind-bending thriller',
      year: 2010,
      director: 'Christopher Nolan',
    },
    {
      _id: '2',
      title: 'The Matrix',
      genre: ['Sci-Fi', 'Action'],
      description: 'A computer programmer discovers reality is a simulation',
      year: 1999,
      director: 'Wachowski Sisters',
    },
    {
      _id: '3',
      title: 'Avatar',
      genre: ['Sci-Fi', 'Adventure'],
      description: 'Humans explore an alien planet',
      year: 2009,
      director: 'James Cameron',
    }
  ];

  // Mock Elasticsearch service
  const mockElasticsearchService = {
    searchMovies: vi.fn()
  };

  // Mock Mongoose Model
  const mockMovieModel = {
    find: vi.fn(),
    findById: vi.fn(),
  } as unknown as Model<Movie>;

  // Create service with mock dependencies
  const movieService = new MovieService(
    mockMovieModel,
    mockElasticsearchService as any
  );

  it('should return movies matching the search query', async () => {
    // Mock Elasticsearch search response
    mockElasticsearchService.searchMovies.mockResolvedValue({
      total: mockMovies.length,
      movies: mockMovies
    });

    const result = await movieService.searchMovies('sci-fi', '');
    
    expect(result.total).toBe(3);
    expect(result.movies.length).toBe(3);
  });

  it('should filter movies by genre', async () => {
    // Mock Elasticsearch search response
    mockElasticsearchService.searchMovies.mockResolvedValue({
      total: 1,
      movies: [mockMovies[1]]
    });

    const result = await movieService.searchMovies('', 'Action');
    
    expect(result.total).toBe(1);
    expect(result.movies[0].title).toBe('The Matrix');
  });

  it('should handle empty search results', async () => {
    // Mock Elasticsearch search response
    mockElasticsearchService.searchMovies.mockResolvedValue({
      total: 0,
      movies: []
    });

    const result = await movieService.searchMovies('nonexistent movie', '');
    
    expect(result.total).toBe(0);
    expect(result.movies.length).toBe(0);
  });

  it('should handle search with multiple parameters', async () => {
    // Mock Elasticsearch search response
    mockElasticsearchService.searchMovies.mockResolvedValue({
      total: 1,
      movies: [mockMovies[1]]
    });

    const result = await movieService.searchMovies('matrix', 'Sci-Fi');
    
    expect(result.total).toBe(1);
    expect(result.movies[0].title).toBe('The Matrix');
  });
});