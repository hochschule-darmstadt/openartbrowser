import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Artwork, EntityType, EntityIcon } from 'src/app/shared/models/models';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
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
  /* List of unique Videos */
  uniqueVideos: string[] = [];

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
      this.uniqueVideos = [];
      this.videoExists = false;
      this.artwork = this.hoveredArtwork = this.hoveredArtwork = null;
      this.imageHidden = this.modalIsVisible = this.commonTagsCollapsed = false;
      // clears items of all artwork tabs
      this.artworkTabs.forEach((tab: ArtworkTab) => (tab.items = []));

      /** Use data service to fetch entity from database */
      const artworkId = params.get('artworkId');
      this.artwork = (await this.dataService.findById<Artwork>(artworkId, EntityType.ARTWORK)) as Artwork;
      if (this.artwork.videos && this.artwork.videos.length > 0) {
        this.uniqueVideos.unshift(this.artwork.videos[0]);
      }

      if (this.artwork) {
        this.mergeMotifs();
        this.resolveIds('main_subjects');

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
   * merges main_subjects into motifs for display in the 'all' and 'motifs' tab of the artwork page
   */
  mergeMotifs() {
    this.artwork.main_subjects.map(motifId => {
      if (!this.artwork.motifs.includes(motifId)) {
        this.artwork.motifs.push(motifId);
      }
    });
  }

  /**
   * function to restrict the displayed motifs on the artwork component
   */
  filterDuplicateMotifs() {
    const mainIds = this.artwork.main_subjects.map(motif => motif.id);
    return this.artwork.motifs.filter(motif => !mainIds.includes(motif.id));
  }

  addUniqueVideos(inputArray) {
    for ( const entity of inputArray) {
      if (entity.videos && entity.videos.length >  0 && !this.uniqueVideos.includes(entity.videos[0])) {
        this.uniqueVideos.push(entity.videos[0]);
      }
    }
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
          this.addUniqueVideos(this.artwork.artists);
          this.addUniqueVideos(this.artwork.movements);
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
