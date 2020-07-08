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
  title?: string;
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
   * resets the artwork component into its initial state for a re-route
   */
  onReset() {
    console.log('reset component');
    this.artworkTabs = [];
    this.uniqueVideos = [];
    this.videoExists = false;
    this.artwork = this.hoveredArtwork = this.hoveredArtwork = null;
    this.imageHidden = this.modalIsVisible = this.commonTagsCollapsed = false;
  }

  /**
   * resolves entityIds to actual entities by invoking the data-service
   */
  loadEntities(attributes: string[]) {
    return Promise.all(attributes.map(async (attribute: string) => await this.resolveIds(attribute)));
  }

  /**
   * @description hook that is executed at component initialization
   */
  ngOnInit() {
    /** Extract the id of entity from URL params. */
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe(async params => {
      this.onReset();

      /** Use data service to fetch entity from elasticsearch */
      const artworkId = params.get('artworkId');
      this.artwork = await this.dataService.findById<Artwork>(artworkId, EntityType.ARTWORK);

      if (!this.artwork) {
        console.log('Could not load Artwork data');
        return null;
      }

      // define attributes (array of entity IDs) that shall be resolved to entities
      const attributes = ['main_subjects', 'motifs', 'artists', 'locations', 'genres', 'movements', 'materials'];
      await this.loadEntities(attributes);

      this.mergeMotifs();
      this.combineEventData();
      this.addUniqueVideos([...this.artwork.artists, ...this.artwork.movements]);

      this.tabSetup();

      // this.insertMainMotifTab();
      // this.loadTabs();

      if (this.artwork.videos && this.artwork.videos.length > 0) {
        this.uniqueVideos.unshift(this.artwork.videos[0]);
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
    this.artwork.main_subjects.forEach(motifId => {
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
    for (const entity of inputArray) {
      if (entity.videos && entity.videos.length > 0 && !this.uniqueVideos.includes(entity.videos[0])) {
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
        const types = usePlural(tab.type);

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

  tabSetup() {
    this.addTab(EntityType.ALL);
    this.artworkTabs[0].active = true;

    this.addTab(EntityType.MOTIF, 'main_motif');

    this.addTab(EntityType.MOTIF);
    this.addTab(EntityType.ARTIST);
    this.addTab(EntityType.LOCATION);
    this.addTab(EntityType.GENRE);
    this.addTab(EntityType.MOVEMENT);
    this.addTab(EntityType.MATERIAL);

    this.fillSummaryTab();
  }

  fillSummaryTab() {}

  /**
   * Add tab to artwork tab array
   * @param type Tab title
   * @param active Is active tab
   */
  private addTab(type: EntityType, title = null) {
    this.artworkTabs.push({
      title: title || type,
      type,
      active: false,
      icon: EntityIcon[type.toUpperCase()],
      items: []
    });
  }

  /**
   * inserts a custom tab that displays related artworks by main motifs.
   * since main motifs are of type motif and not a new entity type, this custom tab logic exists
   */
  async insertMainMotifTab() {
    const main_motifs = this.artwork.main_subjects.map(entity => entity.id);

    const items = await this.dataService.findArtworksByType(EntityType.MOTIF, main_motifs);
  }

  videoFound(event) {
    this.videoExists = this.videoExists ? true : event;
  }

  /**
   * combines the "new" attributes and sorts them by start year
   * (exhibition history and significant event)
   * for a unified display mode
   */
  combineEventData() {
    this.artwork.events = [...this.artwork['exhibition_history'], ...this.artwork['significant_event']]
      .map(event => {
        if (event.type === 'significant_event') {
          event.start_time = event['point_in_time'];
          delete event['point_in_time'];
        }
        return event;
      })
      .sort((left, right) => left.start_time - right.start_time);
  }
}
