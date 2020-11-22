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
  ICONOGRAPHY = 'iconography'
}

export const usePlural = (type: EntityType) => (type === 'all' ? type : type + 's');

export enum EntityIcon {
  ALL = 'fa-list-ul',
  ARTIST = 'fa-user',
  ARTWORK = 'fa-image',
  MOVEMENT = 'fa-wind',
  LOCATION = 'fa-archway',
  MOTIF = 'fa-image',
  GENRE = 'fa-tag',
  MATERIAL = 'fa-scroll',
  ICONOGRAPHY = 'fa-fingerprint'
}
