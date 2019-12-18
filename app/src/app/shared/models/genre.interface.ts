import { Entity } from './entity.interface';
import { EntityIcon } from './entityicon.enum';
import { EntityType } from './entitytype.enum';

export interface Genre extends Entity {
    type: EntityType.GENRE;
    icon: EntityIcon.GENRE;
}
