import {Component, OnInit, OnDestroy} from '@angular/core';
import {Artwork, EntityType} from 'src/app/shared/models/models';
import {takeUntil} from 'rxjs/operators';
import {DataService} from 'src/app/core/services/data.service';
import {ActivatedRoute} from '@angular/router';
import {Subject} from 'rxjs';
import * as _ from 'lodash';

/** interface for the tabs */
interface ArtworkTab {
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
   */
  artwork: Artwork = null;

  /**
   * whether artwork image should be hidden
   */
  imageHidden = false;

  /** @description to toggle details container. true if more infos are folded in */
  collapse = true;

  /** whether artwork image viewer is active or not */
  modalIsVisible = false;

  /** number of artworks tabs intialized */
  artworkTabCounter = 0;

  /**
   * @description to toggle common tags container.
   * initial as true (close).
   */
  collapseDownTags = true;

  /**
   * @description to save the artwork item that is being hovered.
   */
  hoveredArtwork: Artwork = null;

  /**
   * @description for the tabs in slider/carousel.
   */
  artworkTabs: { [key: string]: ArtworkTab } = {
    all: {
      heading: 'all',
      items: [],
      icon: 'list-ul',
      active: true,
    },
    motif: {
      heading: 'motif',
      items: [],
      icon: 'image',
      active: false,
    },
    artist: {
      heading: 'artist',
      items: [],
      icon: 'user',
      active: false,
    },
    location: {
      heading: 'location',
      items: [],
      icon: 'archway',
      active: false,
    },
    genre: {
      heading: 'genre',
      items: [],
      icon: 'tags',
      active: false,
    },
    movement: {
      heading: 'movement',
      items: [],
      icon: 'wind',
      active: false,
    },
    material: {
      heading: 'material',
      items: [],
      icon: 'scroll',
      active: false,
    },
  };

  /**
   * @description use this to end subscription to url parameter in ngOnDestroy
   */
  private ngUnsubscribe = new Subject();

  /**
   * @description to fetch object in the html.
   */
  Object = Object;

  constructor(private dataService: DataService, private route: ActivatedRoute) {
  }

  /**
   * @description hook that is executed at component initialization
   */
  ngOnInit() {
    /** Extract the id of entity from URL params. */
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe(async (params) => {
      this.hoveredArtwork = null;
      const artworkId = params.get('artworkId');
      /** Use data service to fetch entity from database */
      this.artwork = await this.dataService.findById<Artwork>(artworkId, EntityType.ARTWORK);
      /* Count meta data to show more on load */
      this.calculateCollapseState();
      this.resetArtworkTabs();
      this.loadDependencies();
    });
  }

  /**
   * clears items of all artwork tabs
   */
  resetArtworkTabs() {
    this.artworkTabs.all.items = [];
    this.artworkTabs.artist.items = [];
    this.artworkTabs.movement.items = [];
    this.artworkTabs.genre.items = [];
    this.artworkTabs.material.items = [];
    this.artworkTabs.motif.items = [];
    this.artworkTabs.location.items = [];
  }

  /**
   * hide artwork image
   */
  hideImage() {
    this.imageHidden = true;
  }

  /**
   * resolves ids in artwork attributes with actual entities,
   * loads slider items and initializes slider tabs
   */
  loadDependencies() {
    this.artworkTabCounter = 0;
    this.resetArtworkTabs();
    /** load artist related data */
    if (this.artwork) {
      this.dataService.findArtworksByArtists(this.artwork.artists as any).then((artworks) => {
        this.fillArtworkTab(this.artworkTabs.artist, artworks);
      });
      this.dataService.findMultipleById(this.artwork.artists as any, EntityType.ARTIST).then((artists) => {
        this.artwork.artists = artists;
      });

      /** load movement related data */
      this.dataService.findArtworksByMovements(this.artwork.movements as any).then((artworks) => {
        this.fillArtworkTab(this.artworkTabs.movement, artworks);
      });
      this.dataService.findMultipleById(this.artwork.movements as any, EntityType.MOVEMENT).then((movements) => {
        this.artwork.movements = movements;
      });

      /** load genre related data */
      this.dataService.findArtworksByGenres(this.artwork.genres as any).then((artworks) => {
        this.fillArtworkTab(this.artworkTabs.genre, artworks);
      });
      this.dataService.findMultipleById(this.artwork.genres as any, EntityType.GENRE).then((genres) => {
        this.artwork.genres = genres;
      });

      /** load motif related data */
      this.dataService.findArtworksByMotifs(this.artwork.motifs as any).then((artworks) => {
        this.fillArtworkTab(this.artworkTabs.motif, artworks);
      });
      this.dataService.findMultipleById(this.artwork.motifs as any, EntityType.MOTIF).then((motifs) => {
        this.artwork.motifs = motifs;
      });

      /** load loaction related data */
      this.dataService.findArtworksByLocations(this.artwork.locations as any).then((artworks) => {
        this.fillArtworkTab(this.artworkTabs.location, artworks);
      });
      this.dataService.findMultipleById(this.artwork.locations as any, EntityType.LOCATION).then((locations) => {
        this.artwork.locations = locations;
      });

      /** load material related data */
      this.dataService.findArtworksByMaterials(this.artwork.materials as any).then((artworks) => {
        this.fillArtworkTab(this.artworkTabs.material, artworks);
      });
      this.dataService.findMultipleById(this.artwork.materials as any, EntityType.MATERIAL).then((materials) => {
        this.artwork.materials = materials;
      });
    }
  }

  /**
   * initializes an artwork tab with items,
   * filters and shuffles main artwork out of tab items,
   * triggers all tab item selection after all other tabs are resolved
   * @param tab the tab that should be filled
   * @param items the items the tab should be filled with
   */
  fillArtworkTab(tab: ArtworkTab, items: Artwork[]) {
    const filtered = this.shuffle(items.filter((artwork) => artwork.id !== this.artwork.id));
    if (filtered.length > 0) {
      tab.items = filtered;
    }
    ++this.artworkTabCounter;
    if (this.artworkTabCounter === 6) {
      this.selectAllTabItems(10);
    }
  }

  /**
   * @description shuffle the items' categories.
   */
  shuffle = (a: Artwork[]): Artwork[] => {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /**
   * @description show popup image zoom.
   */
  showModal() {
    this.modalIsVisible = true;
  }

  /**
   * @description close popup image zoom.
   */
  closeModal() {
    this.modalIsVisible = false;
  }

  /**
   * @description Hook that is called when a directive, pipe, or service is destroyed.
   */
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  /**
   * @description function to fetch items into 'all' tab from others tabs.
   * use Set to filter duplicates
   * param will determine how many times to loop the tabs
   * get a single artwork in each tab every time it loops (unless duplicate)
   * shuffles the set at the end
   * set var artworkTabs.all.items to this Set
   * @param {number} maxAmountFromEachTab
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
    this.artworkTabs.all.items = this.shuffle(Array.from(items, ([key, value]) => value));
  }

  /**
   * @description function to toggle details container.
   */
  toggleDetails(): void {
    this.collapse = !this.collapse;
  }

  /** calculates the size of meta data item section
   * every attribute: +3
   * if attribute is array and size > 3 -> + arraylength
   */
  private calculateCollapseState() {
    let metaNumber = 0;
    if (this.artwork) {
      if (this.artwork.abstract.length > 400) {
        metaNumber += 10;
      } else if (this.artwork.abstract.length) {
        metaNumber += 3;
      }
      if (!_.isEmpty(this.artwork.genres)) {
        metaNumber += this.artwork.genres.length > 3 ? this.artwork.genres.length : 3;
      }
      if (!_.isEmpty(this.artwork.materials)) {
        metaNumber += this.artwork.materials.length > 3 ? this.artwork.genres.length : 3;
      }
      if (!_.isEmpty(this.artwork.movements)) {
        metaNumber += this.artwork.movements.length > 3 ? this.artwork.movements.length : 3;
      }
      if (!_.isEmpty(this.artwork.motifs)) {
        metaNumber += this.artwork.motifs.length > 3 ? this.artwork.motifs.length : 3;
      }
      if (this.artwork.height && this.artwork.width) {
        metaNumber += 3;
      }
    }
    if (metaNumber < 10) {
      this.collapse = false;
    }
  }

  /**
   * @description function to toggle common tags container.
   */
  toggleCommonTags(): void {
    this.collapseDownTags = !this.collapseDownTags;
  }
}
