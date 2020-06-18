import {Entity, EntityType} from './entity.interface';

export interface Movement extends Entity {
  influenced_by: Partial<Entity>[];
  type: EntityType.MOVEMENT;
  start_time: number;
  end_time: number;
  start_time_est?: number;
  end_time_est?: number;
  has_part: string[];
  part_of: string[];
}
