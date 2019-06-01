import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { NgbCarouselConfig, NgbCarousel } from '@ng-bootstrap/ng-bootstrap';
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
   * @description all 7 carousels in the page. 
   * @type {QueryList<NgbCarousel>}
   * @memberof HomeComponent
   */
  @ViewChildren(NgbCarousel) carousel: QueryList<NgbCarousel>;

  /**
   * @description random url image for the page background 
   * @type {string}
   * @memberof HomeComponent
   */
  backgroundImageUrl: string;

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
    ngb_config.interval = 10000;
    ngb_config.keyboard = false;
    ngb_config.pauseOnHover = false;
  }

  ngOnInit() {
    this.getCategoryItems().then(() => {
      setTimeout(() => {
        this.refreshCarousel(); // need to have a bit delay of time (last categories that is fetched is not refreshing carousel cycle)
      }, 500);
      this.getRandomImage();
    });
  }

  /**
   * @description Fetch items for each category using the service.
   * @memberof HomeComponent
   */
  getCategoryItems = async (): Promise<void> => {
    this.upperCategories.artwork.items = this.shuffle(await this.dataService.get20CategoryItems<Artwork>('artwork'));
    this.upperCategories.artist.items = this.shuffle(await this.dataService.get20CategoryItems<Artist>('artist'));
    this.upperCategories.movement.items = this.shuffle(await this.dataService.get20CategoryItems<Movement>('movement'));
    this.lowerCategories.location.items = this.shuffle(await this.dataService.get20CategoryItems<Location>('location'));
    this.lowerCategories.material.items = this.shuffle(await this.dataService.get20CategoryItems<Material>('material'));
    this.lowerCategories.genre.items = this.shuffle(await this.dataService.get20CategoryItems<Genre>('genre'));
    this.lowerCategories.motif.items = this.shuffle(await this.dataService.get20CategoryItems<Motif>('object'));
  };

  /**
   * @description shuffle the items' categories.
   * @memberof HomeComponent
   */
  shuffle = (a: Entity[]): Entity[] => {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  /**
   * @description make auto next carousel works after fetching categories.
   * @memberof HomeComponent
   */
  refreshCarousel = (): void => {
    this.carousel.forEach((item) => {
      item.cycle();
    });
  };

  /**
   * @description assign backgroundImageUrl with a random image from one of the items.
   * @memberof HomeComponent
   */
  getRandomImage = (): void => {
    let allItems: Entity[] = this.upperCategories['artwork'].items.concat(
      this.upperCategories['artist'].items,
      this.upperCategories['movement'].items,
      this.lowerCategories['location'].items,
      this.lowerCategories['material'].items,
      this.lowerCategories['genre'].items,
      this.lowerCategories['motif'].items
    );
    this.backgroundImageUrl = allItems[Math.floor(Math.random() * (allItems.length))].imageMedium;
  };
}
