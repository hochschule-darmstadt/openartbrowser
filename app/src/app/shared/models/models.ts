export interface Entity {
  id: string;
  label?: string;
  description?: string;
  image?: string;
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
}

export interface Genre extends Entity {}

export interface Location extends Entity {
  country?: string;
  website?: string;
  part_of: Partial<Location>[];
  lat?: string;
  lon?: string;
}

export interface Material extends Entity {}

export interface Movement extends Entity {
  influenced_by: Partial<Entity>[];
}
