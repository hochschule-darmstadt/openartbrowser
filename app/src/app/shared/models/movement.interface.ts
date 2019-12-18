import { Entity, EntityType, EntityIcon, EntityRoute } from './entity.interface';

export interface Movement extends Entity {
    influenced_by: Partial<Entity>[];
    type: EntityType.MOVEMENT;
    icon: EntityIcon.MOVEMENT;
    route: EntityRoute.MOVEMENT;
}
