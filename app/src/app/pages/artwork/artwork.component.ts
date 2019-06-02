import { Component, OnInit, OnDestroy } from '@angular/core';
import { Artwork, EntityType } from 'src/app/shared/models/models';
import { takeUntil } from 'rxjs/operators';
import { DataService } from 'src/app/core/services/data.service';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import * as _ from 'lodash';

/** interface for the tabs */
interface SliderTab {
  heading: string;
  items: Artwork[];
  icon: string;
  active: boolean;
}

@Component({
  selector: 'app-artwork',
  templateUrl: './artwork.component.html',
  styleUrls: ['./artwork.component.scss'],
})
export class ArtworkComponent implements OnInit, OnDestroy {

  /**
   * @description the entity this page is about.
   * @type {Artwork}
   * @memberof ArtworkComponent
   */
  artwork: Artwork = null;

  /**
   * @description to toggle details container.
   * initial as true (close).
   * @type {boolean}
   * @memberof ArtworkComponent
   */
  collapseDown: boolean = true;

  /** whether artwork image viewer is active or not */
  modalIsVisible = false;

  /** score of meta data size */
  metaNumber: number = 0;

  /**
   * @description to toggle common tags container.
   * initial as true (close).
   * @type {boolean}
   * @memberof ArtworkComponent
   */
  collapseDownTags: boolean = true;

  /**
   * @description to save the artwork item that is being hovered.
   * @type {Artwork}
   * @memberof ArtworkComponent
   */
  hoveredArtwork: Artwork = null;

  /**
   * @description for the tabs in slider/carousel.
   * @type {{ [key: string]: SliderTab }}
   * @memberof ArtworkComponent
   */
  artworkTabs: { [key: string]: SliderTab } = {
    all: {
      heading: 'All',
      items: [],
      icon: 'list-ul',
      active: true,
    },
    motif: {
      heading: 'Motif',
      items: [],
      icon: 'image',
      active: false,
    },
    artist: {
      heading: 'Artist',
      items: [],
      icon: 'user',
      active: false,
    },
    location: {
      heading: 'Location',
      items: [],
      icon: 'archway',
      active: false,
    },
    genre: {
      heading: 'Genre',
      items: [],
      icon: 'tags',
      active: false,
    },
    movement: {
      heading: 'Movement',
      items: [],
      icon: 'wind',
      active: false,
    },
    material: {
      heading: 'Material',
      items: [],
      icon: 'scroll',
      active: false,
    },
  };

  /**
   * @description use this to end subscription to url parameter in ngOnDestroy
   * @private
   * @memberof ArtworkComponent
   */
  private ngUnsubscribe = new Subject();

  /**
   * @description to fetch object in the html.
   * @memberof ArtworkComponent
   */
  Object = Object;

  constructor(private dataService: DataService, private route: ActivatedRoute) { }

  /**
   * @description hook that is executed at component initialization
   * @memberof ArtworkComponent
   */
  ngOnInit() {
    /** Extract the id of entity from URL params. */
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe(async (params) => {
      const artworkId = params.get('artworkId');
      /** Use data service to fetch entity from database */
      this.artwork = await this.dataService.findById<Artwork>(artworkId, EntityType.ARTWORK);
      /* Count meta data to show more on load */
      this.calculateCollapseState();
      this.loadDependencies();
    });
  }

  /**
   * TODO: write this shorter
   * resolves ids in artwork attributes with actual entities,
   * loads slider items and initialized slider tabs
   */
  loadDependencies() {
    /** number of sliders that have been loaded to see if all tab is ready to be initialized */
    let loadCounter = 0;

    /** load artist related data */
    this.dataService.findArtworksByArtists(this.artwork.creators as any).then((artworks) => {
      this.artworkTabs.artist.items = artworks.filter((artwork) => artwork.id !== this.artwork.id);
      ++loadCounter;
      if (loadCounter == 6) {
        this.selectAllTabItems(10);
      }
    });
    this.dataService.findMultipleById(this.artwork.creators as any).then((creators) => {
      this.artwork.creators = creators;
    });

    /** load movement related data */
    this.dataService.findArtworksByMovements(this.artwork.movements as any).then((artworks) => {
      this.artworkTabs.movement.items = artworks.filter((artwork) => artwork.id !== this.artwork.id);
      ++loadCounter;
      if (loadCounter == 6) {
        this.selectAllTabItems(10);
      }
    });
    this.dataService.findMultipleById(this.artwork.movements as any).then((movements) => {
      this.artwork.movements = movements;
    });

    /** load genre related data */
    this.dataService.findArtworksByGenres(this.artwork.genres as any).then((artworks) => {
      this.artworkTabs.genre.items = artworks.filter((artwork) => artwork.id !== this.artwork.id);
      ++loadCounter;
      if (loadCounter == 6) {
        this.selectAllTabItems(10);
      }
    });
    this.dataService.findMultipleById(this.artwork.genres as any).then((genres) => {
      this.artwork.genres = genres;
    });

    /** load motif related data */
    this.dataService.findArtworksByMotifs(this.artwork.depicts as any).then((artworks) => {
      this.artworkTabs.motif.items = artworks.filter((artwork) => artwork.id !== this.artwork.id);
      ++loadCounter;
      if (loadCounter == 6) {
        this.selectAllTabItems(10);
      }
    });
    this.dataService.findMultipleById(this.artwork.depicts as any).then((motifs) => {
      this.artwork.depicts = motifs;
    });

    /** load loaction related data */
    this.dataService.findArtworksByLocations(this.artwork.locations as any).then((artworks) => {
      this.artworkTabs.location.items = artworks.filter((artwork) => artwork.id !== this.artwork.id);
      ++loadCounter;
      if (loadCounter == 6) {
        this.selectAllTabItems(10);
      }
    });
    this.dataService.findMultipleById(this.artwork.locations as any).then((locations) => {
      this.artwork.locations = locations;
    });

    /** load material related data */
    this.dataService.findArtworksByMaterials(this.artwork.materials as any).then((artworks) => {
      this.artworkTabs.material.items = artworks.filter((artwork) => artwork.id !== this.artwork.id);
      ++loadCounter;
      if (loadCounter == 6) {
        this.selectAllTabItems(10);
      }
    });
    this.dataService.findMultipleById(this.artwork.materials as any).then((materials) => {
      this.artwork.materials = materials;
    });
  }

  /**
   * @description show popup image zoom.
   * @memberof ArtworkComponent
   */
  showModal() {
    this.modalIsVisible = true;
  }

  /**
   * @description close popup image zoom.
   * @memberof ArtworkComponent
   */
  closeModal() {
    this.modalIsVisible = false;
  }

  /**
   * @description Hook that is called when a directive, pipe, or service is destroyed.
   * @memberof ArtworkComponent
   */
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  /**
   * @description function to fetch items into 'all' tab from others.
   * use Set to filter duplicates
   * param will determine how many times to loop the tabs
   * get a single artwork in each tab every time it loops (unless duplicate)
   * set var artworkTabs.all.items to this Set
   * @param {number} maxAmountFromEachTab
   * @memberof ArtworkComponent
   */
  selectAllTabItems(maxAmountFromEachTab: number): void {
    const items = new Map<string, Artwork>();
    for (let index = 0; index < maxAmountFromEachTab; index++) {
      for (const key of Object.keys(this.artworkTabs)) {
        if (key !== 'all' && this.artworkTabs[key].items && this.artworkTabs[key].items[index]) {
          items.set(this.artworkTabs[key].items[index].id, this.artworkTabs[key].items[index]);
        }
      }
    }
    this.artworkTabs.all.items = Array.from(items, ([key, value]) => value);
  }

  /**
   * @description function to toggle details container.
   * @memberof ArtworkComponent
   */
  toggleDetails(): void {
    this.collapseDown = !this.collapseDown;
  }

  /** calculates the size of meta data item section
   * every attribute: +3
   * if attribute is array and size > 3 -> + arraylength
   */
  calculateCollapseState() {
    this.collapseDown = true;
    if (!_.isEmpty(this.artwork.genres))
      this.metaNumber += this.artwork.genres.length > 3 ? this.artwork.genres.length : 3;
    if (!_.isEmpty(this.artwork.materials))
      this.metaNumber += this.artwork.materials.length > 3 ? this.artwork.genres.length : 3;
    if (!_.isEmpty(this.artwork.movements))
      this.metaNumber += this.artwork.movements.length > 3 ? this.artwork.movements.length : 3;
    if (!_.isEmpty(this.artwork.depicts))
      this.metaNumber += this.artwork.depicts.length > 3 ? this.artwork.depicts.length : 3;
    if (!this.artwork.height && !this.artwork.width)
      this.metaNumber += 3;
    if (this.metaNumber < 10) {
      this.collapseDown = false;
    }
  }
  /**
   * @description function to toggle common tags container.
   * @memberof ArtworkComponent
   */
  toggleCommonTags(): void {
    this.collapseDownTags = !this.collapseDownTags;
  }

  /**
   * @description function to determine if a tab is not empty.
   * @param {string} key
   * @returns {boolean}
   * @memberof ArtworkComponent
   */
  showTab(key: string): boolean {
    if (this.artwork) {
      switch (key) {
        case 'all':
          return true;
        case 'artist':
          return this.artwork.creators && this.artwork.creators.length > 0;
        case 'movement':
          return this.artwork.movements && this.artwork.movements.length > 0;
        case 'genre':
          return this.artwork.genres && this.artwork.genres.length > 0;
        case 'motif':
          return this.artwork.depicts && this.artwork.depicts.length > 0;
        case 'location':
          return this.artwork.locations && this.artwork.locations.length > 0;
        case 'material':
          return this.artwork.materials && this.artwork.materials.length > 0;
        default:
          return false;
      }
    }
  }
}
