import { Entity, EntityType } from './entity.interface';
import { Artist } from './artist.interface';
import { Genre } from './genre.interface';
import { Movement } from './movement.interface';
import { Material } from './material.interface';
import { Motif } from './motif.interface';
import { Class } from './class.interface';

export interface Artwork extends Entity {
  artists: Partial<Artist>[];
  locations: Partial<Location>[];
  classes: Partial<Class>[];
  genres: Partial<Genre>[];
  movements: Partial<Movement>[];
  inception?: number;
  materials: Partial<Material>[];
  motifs: Partial<Motif>[];
  main_subjects: Partial<Motif>[];
  country?: string;
  height?: number;
  height_unit?: string;
  width?: number;
  width_unit?: string;
  length?: number;
  length_unit?: string;
  diameter?: number;
  diameter_unit?: string;
  events?: SignificantEvent[];
  type: EntityType.ARTWORK;
}

export interface SignificantEvent {
  start_time: number;
  end_time?: number;
  label: string;
  description?: string;
  type: string;
}
