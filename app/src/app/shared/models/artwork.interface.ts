import { Entity } from './entity.interface';
import { Artist } from './artist.interface';
import { Genre } from './genre.interface';
import { Movement } from './movement.interface';
import { Material } from './material.interface';
import { Motif } from './motif.interface';

export interface Artwork extends Entity {
    artists: Partial<Artist>[];
    locations: Partial<Location>[];
    genres: Partial<Genre>[];
    movements: Partial<Movement>[];
    inception?: number;
    materials: Partial<Material>[];
    motifs: Partial<Motif>[];
    country?: string;
    height?: number;
    width?: number;
    type: 'artwork';
}
