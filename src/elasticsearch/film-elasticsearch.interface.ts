export interface FilmDocument {
  id?: string;
  title: string;
  year: number;
  genres: string[];
}

export interface FilmElasticsearchService {
  deleteFilm(id: string): Promise<boolean>;
}