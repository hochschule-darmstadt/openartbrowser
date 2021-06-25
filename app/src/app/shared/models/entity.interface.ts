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
  route: string;
  absoluteRank: number;
  relativeRank: number;
  videos?: string;
}

export type Iconclass = string;

export enum EntityType {
  ALL = 'all',
  ARTIST = 'artist',
  ARTWORK = 'artwork',
  GENRE = 'genre',
  LOCATION = 'location',
  MATERIAL = 'material',
  MOVEMENT = 'movement',
  MOTIF = 'motif',
  CLASS = 'class'
}

export const usePlural = (type: EntityType) => {
  if(type === 'all')
    return type;
  else if (type === 'class')
    return 'classes';
  else
    return type + 's';
}

export const useSingular = (entityType: string) => {
  if(entityType === 'classes')
    return entityType.slice(0, -2);
  else
    return entityType.slice(0, -1);
}

export enum EntityIcon {
  ALL = 'fa-list-ul',
  ARTIST = 'fa-user',
  ARTWORK = 'fa-image',
  MOVEMENT = 'fa-wind',
  LOCATION = 'fa-archway',
  MOTIF = 'fa-shapes',
  GENRE = 'fa-tag',
  MATERIAL = 'fa-scroll',
  CLASS = 'fa-shapes'
}
