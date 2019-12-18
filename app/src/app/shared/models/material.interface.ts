import { Entity, EntityType, EntityIcon, EntityRoute } from './entity.interface';

export interface Material extends Entity {
    type: EntityType.MATERIAL;
    icon: EntityIcon.MATERIAL;
    route: EntityRoute.MATERIAL;
}
