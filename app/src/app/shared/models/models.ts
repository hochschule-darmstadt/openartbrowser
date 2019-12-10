export interface Entity {
  id: string;
  label?: string;
  description?: string;
  abstract?: string;
  wikipediaLink?: string;
  image?: string;
  imageSmall?: string;
  imageMedium?: string;
  type: EntityType;
  absoluteRank: number;
  relativeRank: number;
}

export interface Artist extends Entity {
  gender?: 'male' | 'female';
  date_of_birth?: number;
  date_of_death?: number;
  place_of_birth?: string;
  place_of_death?: string;
  citizenship?: string;
  movements: Partial<Movement>[];
  influenced_by: Partial<Artist>[];
  type: EntityType.ARTIST;
}

export interface Artwork extends Entity {
  artists: Partial<Artist>[];
  locations: Partial<Location>[];
  genres: Partial<Genre>[];
  movements: Partial<Movement>[];
  inception?: number;
  materials: Partial<Material>[];
  motifs: Partial<Motif>[];
  country?: string;
  height?: number;
  width?: number;
  type: EntityType.ARTWORK;
}

export interface Genre extends Entity {
  type: EntityType.GENRE;
}

export interface Location extends Entity {
  country?: string;
  website?: string;
  part_of: Partial<Location>[];
  lat?: string;
  lon?: string;
  type: EntityType.LOCATION;
}

export interface Material extends Entity {
  type: EntityType.MATERIAL;
}

export interface Movement extends Entity {
  influenced_by: Partial<Entity>[];
  type: EntityType.MOVEMENT;
}

export interface Motif extends Entity {
  type: EntityType.MOTIF;
}

export interface artSearch {
  motifs?: string[];
  artists?: string[];
  movements?: string[];
  genres?: string[];
  materials?: string[];
  locations?: string[];
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

export interface TagItem {
  label: string;
  type?: string;
  id?: string;
}
