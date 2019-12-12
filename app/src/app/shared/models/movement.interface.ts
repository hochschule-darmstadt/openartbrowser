import { Entity } from './entity.interface';

export interface Movement extends Entity {
    influenced_by: Partial<Entity>[];
    type: 'movement';
}
