import { Component, OnInit } from '@angular/core';
import { NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap';
import { Entity, Artist, Artwork, Movement, Material, Location, Genre, Motif } from 'src/app/shared/models/models';
import { DataService } from 'src/app/core/services/data.service';

/**
 * @description Interface for the category sliders.
 * @export
 * @interface SliderCategory
 */
export interface SliderCategory {
  items: Entity[];
  icon: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {

  /**
   * @description variable of object to be fetch in html
   * @memberof HomeComponent
   */
  Object = Object;

  /**
   * @description variable of the first 3 categories.
   * @type {{ [key: string]: SliderCategory }}
   * @memberof HomeComponent
   */
  upperCategories: { [key: string]: SliderCategory } = {
    artwork: {
      items: [],
      icon: 'palette',
    },
    artist: {
      items: [],
      icon: 'user',
    },
    movement: {
      items: [],
      icon: 'wind',
    },
  };

  /**
   * @description variable of the next 4 categories.
   * @type {{ [key: string]: SliderCategory }}
   * @memberof HomeComponent
   */
  lowerCategories: { [key: string]: SliderCategory } = {
    location: {
      items: [],
      icon: 'archway',
    },
    material: {
      items: [],
      icon: 'scroll',
    },
    genre: {
      items: [],
      icon: 'tags',
    },
    motif: {
      items: [],
      icon: 'image',
    },
  };

  constructor(public dataService: DataService, ngb_config: NgbCarouselConfig) {
    /** set configuration of ngbCarousel */
    ngb_config.pauseOnHover = false;
    ngb_config.interval = 10000;
  }

  ngOnInit() {
    this.getCategoryItems();

  }

  /**
   * @description Fetch items for each category using the service.
   * @memberof HomeComponent
   */
  getCategoryItems = async (): Promise<void> => {
    this.upperCategories.artwork.items = await this.dataService.get10CategoryItems<Artwork>('artwork');
    this.upperCategories.artist.items = await this.dataService.get10CategoryItems<Artist>('artist');
    this.upperCategories.movement.items = await this.dataService.get10CategoryItems<Movement>('movement');
    this.lowerCategories.location.items = await this.dataService.get10CategoryItems<Location>('location');
    this.lowerCategories.material.items = await this.dataService.get10CategoryItems<Material>('material');
    this.lowerCategories.genre.items = await this.dataService.get10CategoryItems<Genre>('genre');
    this.lowerCategories.motif.items = await this.dataService.get10CategoryItems<Motif>('object');
  };
}
