import { Entity, EntityType } from './entity.interface';

export interface Class extends Entity {
  type: EntityType.CLASS;
}
