import { vi, describe, it, expect } from 'vitest';
import { MoviesService } from './movies.service';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';
import { Movie } from './schemas/movie.schema';

describe('MoviesService - Search Functionality', () => {
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
    search: vi.fn()
  };

  // Create service with mock dependencies
  const moviesService = new MoviesService(
    mockElasticsearchService as any
  );

  it('should return movies matching the search query', async () => {
    // Mock Elasticsearch search response
    mockElasticsearchService.search.mockResolvedValue({
      hits: {
        hits: mockMovies.map(movie => ({ _source: movie })),
        total: { value: mockMovies.length }
      }
    });

    const result = await moviesService.searchMovies('sci-fi');
    
    expect(result.total).toBe(3);
    expect(result.movies.length).toBe(3);
    expect(result.movies.every(movie => movie.genre.includes('Sci-Fi'))).toBeTruthy();
  });

  it('should filter movies by genre', async () => {
    // Mock Elasticsearch search response
    mockElasticsearchService.search.mockResolvedValue({
      hits: {
        hits: [mockMovies[1]].map(movie => ({ _source: movie })),
        total: { value: 1 }
      }
    });

    const result = await moviesService.searchMovies('', ['Action']);
    
    expect(result.total).toBe(1);
    expect(result.movies[0].title).toBe('The Matrix');
  });

  it('should handle empty search results', async () => {
    // Mock Elasticsearch search response
    mockElasticsearchService.search.mockResolvedValue({
      hits: {
        hits: [],
        total: { value: 0 }
      }
    });

    const result = await moviesService.searchMovies('nonexistent movie');
    
    expect(result.total).toBe(0);
    expect(result.movies.length).toBe(0);
  });

  it('should handle search with multiple filters', async () => {
    // Mock Elasticsearch search response
    mockElasticsearchService.search.mockResolvedValue({
      hits: {
        hits: [mockMovies[1]].map(movie => ({ _source: movie })),
        total: { value: 1 }
      }
    });

    const result = await moviesService.searchMovies('matrix', ['Sci-Fi', 'Action']);
    
    expect(result.total).toBe(1);
    expect(result.movies[0].title).toBe('The Matrix');
  });
});