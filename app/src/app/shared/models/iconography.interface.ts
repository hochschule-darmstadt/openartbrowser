import { Entity } from './entity.interface';

export interface Iconography extends Entity {
  parents: Array<object>;
  children: Array<object>;
  keywords: object;
  text: IconographyText;
}

export interface IconographyText {
  fi: string;
  fr: string;
  de: string;
  en: string;
  it: string;
}
