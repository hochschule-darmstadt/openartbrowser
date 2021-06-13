import { Entity, EntityType } from './entity.interface';

export interface Class extends Entity {
  type: EntityType.CLASS;
  subclass_of?: string[];
}
