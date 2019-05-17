import { Entity } from './models';

/**
 * @description general interface for slider.
 * @export
 * @interface Slider
 */
export interface Slider {
    items: Entity[];
    icon: string;
  }
  
  /**
   * @description extended slider interface to be used in related artworks.
   * @export
   * @interface SliderTab
   * @extends {Slider}
   */
  export interface SliderTab extends Slider {
    heading: string;
    active: boolean;
  }