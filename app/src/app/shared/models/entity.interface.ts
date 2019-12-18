import { EntityType } from './entitytype.enum';
import { EntityIcon } from './entityicon.enum';

export type Iconclass = string;

export interface Entity {
    id: string;
    label?: string;
    description?: string;
    abstract?: string;
    wikipediaLink?: string;
    image?: string;
    imageSmall?: string;
    imageMedium?: string;
    iconclasses?: Array<Iconclass>;
    type: EntityType;
    icon: EntityIcon;
    absoluteRank: number;
    relativeRank: number;
    videos?: string;
  }
  