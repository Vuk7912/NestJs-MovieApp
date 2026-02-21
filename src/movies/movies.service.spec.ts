import { describe, it, expect } from 'vitest';
import { MoviesService, Movie } from './movies.service';

describe('MoviesService', () => {
  let moviesService: MoviesService;

  beforeEach(() => {
    moviesService = new MoviesService();
  });

  describe('searchMovies', () => {
    it('should return all movies when no query or genres are provided', () => {
      const results = moviesService.searchMovies('');
      expect(results.length).toBe(3);
    });

    it('should find movies by title query', () => {
      const results = moviesService.searchMovies('inception');
      expect(results.length).toBe(1);
      expect(results[0].title).toBe('Inception');
    });

    it('should find movies by description query', () => {
      const results = moviesService.searchMovies('simulation');
      expect(results.length).toBe(1);
      expect(results[0].title).toBe('The Matrix');
    });

    it('should filter movies by genre', () => {
      const results = moviesService.searchMovies('', ['sci-fi']);
      expect(results.length).toBe(3);
    });

    it('should combine query and genre filtering', () => {
      const results = moviesService.searchMovies('matrix', ['sci-fi']);
      expect(results.length).toBe(1);
      expect(results[0].title).toBe('The Matrix');
    });

    it('should be case-insensitive for query', () => {
      const results = moviesService.searchMovies('INCEPTION');
      expect(results.length).toBe(1);
      expect(results[0].title).toBe('Inception');
    });

    it('should return empty array when no matches found', () => {
      const results = moviesService.searchMovies('nonexistent movie');
      expect(results.length).toBe(0);
    });
  });
});