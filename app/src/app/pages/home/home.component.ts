import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { NgbCarouselConfig, NgbCarousel } from '@ng-bootstrap/ng-bootstrap';
import {
  Entity,
  Artist,
  Artwork,
  Movement,
  Material,
  Location,
  Genre,
  Motif,
  Class,
  EntityIcon,
  EntityType
} from 'src/app/shared/models/models';
import { DataService } from 'src/app/core/services/elasticsearch/data.service';
import { shuffle } from 'src/app/core/services/utils.service';
import homeContent from 'src/config/home_content.json';

/**
 * @description Interface for the category sliders.
 * @export
 */
export interface SliderCategory {
  items: Entity[];
  type: EntityType;
  icon: EntityIcon;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  /**
   * @description all 7 carousels in the page.
   */
  @ViewChildren(NgbCarousel) carousel: QueryList<NgbCarousel>;

  /**
   * @description random url image for the page background
   */
  backgroundImageUrl: string;

  /**
   * @description variable of object to be fetch in html
   */
  Object = Object;

  /**
   * variable of the categories.
   */
  artworkCategory: SliderCategory;
  artistCategory: SliderCategory;
  movementCategory: SliderCategory;
  locationCategory: SliderCategory;
  materialCategory: SliderCategory;
  genreCategory: SliderCategory;
  motifCategory: SliderCategory;
  classCategory: SliderCategory;

  constructor(public dataService: DataService, ngbConfig: NgbCarouselConfig) {
    /** set configuration of ngbCarousel */
    ngbConfig.interval = 10000;
    ngbConfig.keyboard = false;
    ngbConfig.pauseOnHover = true;
  }

  ngOnInit() {
    this.setBackground();
    this.getSlides();
  }

  /**
   * @description Fetch items for each category using the service. Retrun an array of slider category items.
   */
  private getSlides() {
    this.getSliderCategory<Artwork>(EntityType.ARTWORK).then(slide => this.artworkCategory = slide);
    this.getSliderCategory<Artist>(EntityType.ARTIST).then(slide => this.artistCategory = slide);
    this.getSliderCategory<Movement>(EntityType.MOVEMENT).then(slide => this.movementCategory = slide);
    this.getSliderCategory<Location>(EntityType.LOCATION).then(slide => this.locationCategory = slide);
    this.getSliderCategory<Material>(EntityType.MATERIAL).then(slide => this.materialCategory = slide);
    this.getSliderCategory<Genre>(EntityType.GENRE).then(slide => this.genreCategory = slide);
    this.getSliderCategory<Motif>(EntityType.MOTIF).then(slide => this.motifCategory = slide);
    this.getSliderCategory<Class>(EntityType.CLASS).then(slide => this.classCategory = slide);
  }

  /**
   * @description Get categories by entity type. Return SliderCategory object.
   */
  private async getSliderCategory<T>(category: EntityType): Promise<SliderCategory> {
    const items = shuffle(await this.dataService.getCategoryItems<T>(category));
    return { items, type: category, icon: EntityIcon[category.toUpperCase()] };
  }

  private setBackground() {
    // assign backgroundImageUrl with a random image specified in the config folder.
    const backgroundArtworksUrls = homeContent.images;
    this.backgroundImageUrl = backgroundArtworksUrls[Math.floor(Math.random() * backgroundArtworksUrls.length)];
  }

  /**
   * @description make auto next carousel works after fetching categories.
   */
  private refreshCarousel(): void {
    this.carousel.forEach(item => item.cycle());
  }
}
