import { Entity } from './entity.interface';
import { EntityType } from './entitytype.enum';
import { EntityIcon } from './entityicon.enum';

export interface Location extends Entity {
    country?: string;
    website?: string;
    part_of: Partial<Location>[];
    lat?: string;
    lon?: string;
    type: EntityType.LOCATION;
    icon: EntityIcon.LOCATION;
}
