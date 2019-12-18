import { Entity } from './entity.interface';
import { EntityType } from './entitytype.enum';
import { EntityIcon } from './entityicon.enum';

export interface Material extends Entity {
    type: EntityType.MATERIAL;
    icon: EntityIcon.MATERIAL;
}
