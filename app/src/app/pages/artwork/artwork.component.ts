import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Artwork, EntityType, EntityIcon } from 'src/app/shared/models/models';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import * as _ from 'lodash';
import { DataService } from 'src/app/core/services/elasticsearch/data.service';
import { shuffle } from 'src/app/core/services/utils.service';
import { usePlural } from 'src/app/shared/models/entity.interface';

/** interface for the tabs */
interface ArtworkTab {
  type: EntityType;
  items: Artwork[];
  icon: EntityIcon;
  active: boolean;
}

@Component({
  selector: 'app-artwork',
  templateUrl: './artwork.component.html',
  styleUrls: ['./artwork.component.scss']
})
export class ArtworkComponent implements OnInit, OnDestroy {
  /* TODO:REVIEW
    Similiarities in every page-Component:
    - variables: ngUnsubscribe, collapse (here: detailsCollapsed), dataService, route
    - ngOnDestroy, calculateCollapseState, ngOnInit

    1. Use Inheritance (Root-Page-Component) or Composition
    2. Inject entity instead of artwork
  */

  /**
   * @description the entity this page is about.
   */
  artwork: Artwork = null;

  /**
   * whether artwork image should be hidden
   */
  imageHidden = false;

  /**
   * @description to toggle details container.
   * true if more infos are folded in.
   * initial as true (closed).
   */
  detailsCollapsed = true;

  /**
   * @description to toggle common tags container.
   * initial as false (open).
   */
  commonTagsCollapsed = false;

  /**
   * @descriptionwhether artwork image viewer is active or not
   */
  modalIsVisible = false;

  /**
   * @description to save the artwork item that is being hovered.
   */
  hoveredArtwork: Artwork = null;

  /**
   * @description for the tabs in slider/carousel.
   */
  artworkTabs: ArtworkTab[] = [];

  /**
   * @description use this to end subscription to url parameter in ngOnDestroy
   */
  private ngUnsubscribe = new Subject();

  /** a video was found */
  videoExists = false;

  constructor(private dataService: DataService, private route: ActivatedRoute) {}

  /**
   * @description hook that is executed at component initialization
   */
  ngOnInit() {
    // define tabs if not set
    if (!this.artworkTabs || !this.artworkTabs.length) {
      this.addTab(EntityType.ALL, true);
      this.addTab(EntityType.MOTIF);
      this.addTab(EntityType.ARTIST);
      this.addTab(EntityType.LOCATION);
      this.addTab(EntityType.GENRE);
      this.addTab(EntityType.MOVEMENT);
      this.addTab(EntityType.MATERIAL);
    }

    /** Extract the id of entity from URL params. */
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe(async params => {
      /* reset properties */
      this.videoExists = false;
      this.artwork = this.hoveredArtwork = this.hoveredArtwork = null;
      this.imageHidden = this.modalIsVisible = this.commonTagsCollapsed = false;
      this.detailsCollapsed = true;
      // clears items of all artwork tabs
      this.artworkTabs.forEach((tab: ArtworkTab) => (tab.items = []));

      /** Use data service to fetch entity from database */
      const artworkId = params.get('artworkId');
      this.artwork = (await this.dataService.findById<Artwork>(artworkId, EntityType.ARTWORK)) as Artwork;

      if (this.artwork) {
        this.resolveIds('main_subjects');

        /* Count meta data to show more on load */
        this.calculateCollapseState();
        /* load tabs content */
        this.loadTabs();
      }
    });
  }

  /**
   * resolves Ids to actual entities
   * @param key attribute on this.artwork
   */
  async resolveIds(key: string) {
    this.artwork[key] = await this.dataService.findMultipleById(this.artwork[key] as string[]);
  }

  /**
   * hide artwork image
   */
  hideImage() {
    this.imageHidden = true;
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
   * @description close popup image zoom with escape key
   */
  @HostListener('window:keydown.esc') escEvent() {
    this.closeModal();
  }

  /**
   * @description Hook that is called when a directive, pipe, or service is destroyed.
   */
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  /**
   * resolves ids in artwork attributes with actual entities,
   * loads slider items and initializes slider tabs
   */
  private loadTabs() {
    /** get all tab */
    const allTab = this.artworkTabs.filter((tab: ArtworkTab) => tab.type === EntityType.ALL).pop();

    /** load artist related data */
    Promise.all(
      /** load related data for each tab  */
      this.artworkTabs.map(async (tab: ArtworkTab) => {
        if (tab.type === EntityType.ALL) {
          return;
        }

        const types = usePlural(tab.type);

        // load entities
        this.dataService.findMultipleById(this.artwork[types] as any, tab.type).then(artists => {
          this.artwork[types] = artists;
        });
        // load related artworks by type
        return await this.dataService.findArtworksByType(tab.type, this.artwork[types] as any).then(artworks => {
          // filters and shuffles main artwork out of tab items,
          tab.items = shuffle(artworks.filter(artwork => artwork.id !== this.artwork.id));
          // put items into 'all' tab
          allTab.items.push(...tab.items.slice(0, 10));
        });
      })
    ).then(
      () =>
        // filter duplicates and shuffles it
        (allTab.items = shuffle(Array.from(new Set(allTab.items))))
    );
  }

  /** Decides whether to show the 'more' section or not based on the amount of available data:
   * calculates the size of meta data item section
   * every attribute: +3
   * if attribute is array and size > 3 -> + arraylength
   */
  private calculateCollapseState() {
    let metaNumber = 0;
    // set defauled (closed)
    this.detailsCollapsed = true;

    if (this.artwork.abstract.length > 400) {
      metaNumber += 10;
    } else if (this.artwork.abstract.length) {
      metaNumber += 3;
    }
    if (!_.isEmpty(this.artwork.genres.filter(Boolean))) {
      metaNumber += this.artwork.genres.length > 3 ? this.artwork.genres.length : 3;
    }
    if (!_.isEmpty(this.artwork.materials.filter(Boolean))) {
      metaNumber += this.artwork.materials.length > 3 ? this.artwork.materials.length : 3;
    }
    if (!_.isEmpty(this.artwork.movements.filter(Boolean))) {
      metaNumber += this.artwork.movements.length > 3 ? this.artwork.movements.length : 3;
    }
    if (!_.isEmpty(this.artwork.motifs.filter(Boolean))) {
      metaNumber += this.artwork.motifs.length > 3 ? this.artwork.motifs.length : 3;
    }
    if (this.artwork.height && this.artwork.width) {
      metaNumber += 3;
    }
    if (!_.isEmpty(this.artwork.iconclasses.filter(Boolean))) {
      metaNumber += this.artwork.iconclasses.length > 3 ? this.artwork.iconclasses.length : 3;
    }
    if (metaNumber < 10) {
      this.detailsCollapsed = false;
    }
  }

  /**
   * Add tab to artwork tab array
   * @param type Tab title
   * @param active Is active tab
   */
  private addTab(type: EntityType, active: boolean = false) {
    this.artworkTabs.push({
      active,
      icon: EntityIcon[type.toUpperCase()],
      type,
      items: []
    });
  }

  videoFound(event) {
    this.videoExists = this.videoExists ? true : event;
  }
}
