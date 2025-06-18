import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MovieDocument = HydratedDocument<Movie>;

@Schema()
export class Movie {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: [String], default: [] })
  genre: string[];

  @Prop({ type: String })
  description: string;

  @Prop({ type: Number })
  year: number;

  @Prop({ type: String })
  director: string;
}

export const MovieSchema = SchemaFactory.createForClass(Movie);