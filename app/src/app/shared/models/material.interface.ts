import { Entity, EntityType } from './entity.interface';

export interface Material extends Entity {
    type: EntityType.MATERIAL;
}
