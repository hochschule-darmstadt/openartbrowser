import { Entity } from './entity.interface';
import { Movement } from './movement.interface';
import { EntityType } from './entitytype.enum';
import { EntityIcon } from './entityicon.enum';

export interface Artist extends Entity {
    gender?: 'male' | 'female';
    date_of_birth?: number;
    date_of_death?: number;
    place_of_birth?: string;
    place_of_death?: string;
    citizenship?: string;
    movements: Partial<Movement>[];
    influenced_by: Partial<Artist>[];
    type: EntityType.ARTIST;
    icon: EntityIcon.ARTIST;
}
