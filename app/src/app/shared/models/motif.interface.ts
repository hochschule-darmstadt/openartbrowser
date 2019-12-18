import { Entity } from './entity.interface';
import { EntityType } from './entitytype.enum';
import { EntityIcon } from './entityicon.enum';

export interface Motif extends Entity {
    type: EntityType.MOTIF;
    icon: EntityIcon.MOTIF;
}
