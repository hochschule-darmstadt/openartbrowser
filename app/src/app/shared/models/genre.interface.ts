import { Entity, EntityType, EntityIcon, EntityRoute } from './entity.interface';

export interface Genre extends Entity {
    type: EntityType.GENRE;
    icon: EntityIcon.GENRE;
    route: EntityRoute.GENRE;
}
