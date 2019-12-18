import { Entity, EntityType, EntityIcon, EntityRoute } from './entity.interface';

export interface Motif extends Entity {
    type: EntityType.MOTIF;
    icon: EntityIcon.MOTIF;
    route: EntityRoute.MOTIF;
}
