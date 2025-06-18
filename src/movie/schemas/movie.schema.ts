import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MovieDocument = HydratedDocument<Movie>;

@Schema()
export class Movie {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true })
  title: string;

  @Prop({ type: [String], default: [] })
  genre: string[];

  @Prop()
  description: string;

  @Prop()
  year: number;

  @Prop()
  director: string;
}

export const MovieSchema = SchemaFactory.createForClass(Movie);