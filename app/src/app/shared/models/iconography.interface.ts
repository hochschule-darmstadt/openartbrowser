// TODO: this is not final
import { EntityIcon, EntityType } from './entity.interface';

export interface EntityCore {
  id: string;
  type: EntityType;
  label: string;
  icon: EntityIcon;
}

export interface Iconography extends EntityCore {
  parents: Array<object>;
  children: Array<object>;
  keywords: object;
  text: IconographyText;
}

export interface IconographyText extends EntityCore {
  fi: string;
  fr: string;
  de: string;
  en: string;
  it: string;
}
