import { Entity, EntityType, EntityIcon, EntityRoute } from './entity.interface';

export interface Location extends Entity {
    country?: string;
    website?: string;
    part_of: Partial<Location>[];
    lat?: string;
    lon?: string;
    type: EntityType.LOCATION;
    icon: EntityIcon.LOCATION;
    route: EntityRoute.LOCATION;
}
