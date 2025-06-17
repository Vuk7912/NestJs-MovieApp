import { Injectable } from '@nestjs/common';

export interface Movie {
  id: number;
  title: string;
  genre: string[];
  description: string;
}

@Injectable()
export class MoviesService {
  private movies: Movie[] = [
    { 
      id: 1, 
      title: 'Inception', 
      genre: ['sci-fi', 'action'], 
      description: 'A mind-bending thriller about dream infiltration' 
    },
    { 
      id: 2, 
      title: 'The Matrix', 
      genre: ['sci-fi', 'action'], 
      description: 'A computer programmer discovers reality is a simulation' 
    },
    { 
      id: 3, 
      title: 'Interstellar', 
      genre: ['sci-fi', 'drama'], 
      description: 'Space exploration to save humanity' 
    }
  ];

  searchMovies(query: string, genres?: string[]): Movie[] {
    // Validate inputs
    if (!query && (!genres || genres.length === 0)) {
      return this.movies;
    }

    // Filter movies based on query and genres
    return this.movies.filter(movie => {
      const matchesQuery = !query || 
        movie.title.toLowerCase().includes(query.toLowerCase()) || 
        movie.description.toLowerCase().includes(query.toLowerCase());
      
      const matchesGenres = !genres || genres.length === 0 || 
        genres.some(genre => movie.genre.includes(genre.toLowerCase()));
      
      return matchesQuery && matchesGenres;
    });
  }
}