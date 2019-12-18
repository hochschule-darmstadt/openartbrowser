
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
  route: EntityRoute;
  absoluteRank: number;
  relativeRank: number;
  videos?: string;
}

export type Iconclass = string;

export enum EntityRoute {
  ARTIST = '/artist/',
  ARTWORK = '/artwork/',
  GENRE = '/genre/',
  LOCATION = '/location/',
  MATERIAL = '/material/',
  MOVEMENT = '/movement/',
  MOTIF = '/motif/'
}

export enum EntityIcon {
  ARTIST = 'palette',
  ARTWORK = 'user',
  GENRE = 'tags',
  LOCATION = 'archway',
  MATERIAL = 'scroll',
  MOVEMENT = 'wind',
  MOTIF = 'image'
}

export enum EntityType {
  ARTIST = 'artist',
  ARTWORK = 'artwork',
  GENRE = 'genre',
  LOCATION = 'location',
  MATERIAL = 'material',
  MOVEMENT = 'movement',
  MOTIF = 'motif'
}
