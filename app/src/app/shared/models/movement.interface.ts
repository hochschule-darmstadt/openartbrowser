import { Entity } from './entity.interface';
import { EntityType } from './entitytype.enum';
import { EntityIcon } from './entityicon.enum';

export interface Movement extends Entity {
    influenced_by: Partial<Entity>[];
    type: EntityType.MOVEMENT;
    icon: EntityIcon.MOVEMENT;
}
