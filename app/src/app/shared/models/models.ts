export interface Entity {
  id: string;
  label?: string;
  description?: string;
  image?: string;
  type: string;
}

export interface Artist extends Entity {
  gender?: 'male' | 'female';
  date_of_birth?: number;
  date_of_death?: number;
  place_of_birth?: string;
  place_of_death?: string;
  citizenship?: string;
  movements: Partial<Movement>[];
  influencedBy: Partial<Artist>[];
  type: 'artist';
}

export interface Artwork extends Entity {
  creators: Partial<Artist>[];
  locations: Partial<Location>[];
  genres: Partial<Genre>[];
  movements: Partial<Movement>[];
  inception?: number;
  materials: Partial<Material>[];
  depicts: Partial<Object>[];
  country?: string;
  height?: number;
  width?: number;
  type: 'artwork';
}

export interface Genre extends Entity {
  type: 'genre';
}

export interface Location extends Entity {
  country?: string;
  website?: string;
  part_of: Partial<Location>[];
  lat?: string;
  lon?: string;
  type: 'location';
}

export interface Material extends Entity {
  type: 'material';
}

export interface Movement extends Entity {
  influenced_by: Partial<Entity>[];
  type: 'movement';
}

export interface Motif extends Entity {
  type: 'motif';
}
