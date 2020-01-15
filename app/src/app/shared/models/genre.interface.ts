import { Entity, EntityType } from './entity.interface';

export interface Genre extends Entity {
    type: EntityType.GENRE;
}
