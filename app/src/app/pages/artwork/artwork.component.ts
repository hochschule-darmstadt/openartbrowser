import { Component, OnInit, OnDestroy, HostListener, Inject, LOCALE_ID } from '@angular/core';
import { Artwork, EntityType, Iconclass, EntityIcon } from 'src/app/shared/models/models';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import * as _ from 'lodash';
import { DataService } from 'src/app/core/services/elasticsearch/data.service';
import { shuffle } from 'src/app/core/services/utils.service';
import { async } from 'q';

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
  styleUrls: ['./artwork.component.scss'],
})
export class ArtworkComponent implements OnInit, OnDestroy {
  /**
   * @description the entity this page is about.
   */
  artwork: Artwork = null;

  iconclassData: Array<any> | null = null;
  locale: string = 'en';

  /**
   * whether artwork image should be hidden
   */
  imageHidden = false;

  /** @description to toggle details container. true if more infos are folded in */
  collapseDetails = true;

  /**
   * @description to toggle common tags container.
   * initial as false (open).
   */
  collapseTags = false;


  /** whether artwork image viewer is active or not */
  modalIsVisible = false;

  /**
   * @description to save the artwork item that is being hovered.
   */
  hoveredArtwork: Artwork = null;

  /**
   * @description for the tabs in slider/carousel.
   */
  artworkTabs: ArtworkTab[] = []

  /**
   * @description use this to end subscription to url parameter in ngOnDestroy
   */
  private ngUnsubscribe = new Subject();

  constructor(private dataService: DataService, private route: ActivatedRoute, @Inject(LOCALE_ID) locale_id: string) {
    this.locale = locale_id.substr(0, 2);
  }

  /**
   * @description hook that is executed at component initialization
   */
  ngOnInit() {
    // define tabs if not set
    if (!this.artworkTabs || !this.artworkTabs.length) {
      this.addTab(EntityType.ALL, EntityIcon.ALL, true);
      this.addTab(EntityType.MOTIF, EntityIcon.MOTIF);
      this.addTab(EntityType.ARTIST, EntityIcon.ARTIST);
      this.addTab(EntityType.LOCATION, EntityIcon.LOCATION);
      this.addTab(EntityType.GENRE, EntityIcon.GENRE);
      this.addTab(EntityType.MOVEMENT, EntityIcon.MOVEMENT);
      this.addTab(EntityType.MATERIAL, EntityIcon.MATERIAL);
    }

    /** Extract the id of entity from URL params. */
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe(async (params) => {
      /* reset properties */
      this.artwork = this.hoveredArtwork = this.iconclassData = this.hoveredArtwork = null;
      this.imageHidden = this.modalIsVisible = this.collapseDownTags = false;
      this.collapse = true;
      // clears items of all artwork tabs
      this.artworkTabs.forEach((tab: ArtworkTab) => tab.items = []);

      /** Use data service to fetch entity from database */
      const artworkId = params.get('artworkId');
      this.artwork = await this.dataService.findById<Artwork>(artworkId, EntityType.ARTWORK);

      if (this.artwork) {
        /* Count meta data to show more on load */
        this.calculateCollapseState();
        /* load tabs content */
        this.loadTabs();

        if (this.artwork.iconclasses) {
          const nonEmptyIconclasses = this.artwork.iconclasses.filter((i: Iconclass) => i !== '');
          if (!nonEmptyIconclasses.length)
            this.iconclassData = await this.dataService.getIconclassData(nonEmptyIconclasses);
        }
      }
    });
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
   * @description function to toggle details container.
   */
  toggleDetails(): void {
    this.collapseDetails = !this.collapseDetails;
  }

  /**
     * @description function to toggle common tags container.
     */
  toggleTags(): void {
    this.collapseTags = !this.collapseTags;
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
        const types = tab.type + 's';
        if (tab.type == EntityType.ALL) return;

        // load entities 
        this.dataService.findMultipleById(this.artwork[types] as any, tab.type)
          .then((artists) => {
            this.artwork[types] = artists;
          });
        // load related artworks by type
        return await this.dataService.findArtworksByType(types, this.artwork[types] as any)
          .then((artworks) => {
            // filters and shuffles main artwork out of tab items,
            tab.items = shuffle(artworks.filter((artwork) => artwork.id !== this.artwork.id));
            // put items into 'all' tab
            allTab.items.push(...tab.items.slice(0, 10));
          });
      })
    ).then(() =>
      // filter duplicates and shuffles it
      allTab.items = shuffle(Array.from(new Set(allTab.items)))
    );
  }

  /** calculates the size of meta data item section
   * every attribute: +3
   * if attribute is array and size > 3 -> + arraylength
   */
  private calculateCollapseState() {
    let metaNumber = 0;

    if (this.artwork.abstract.length > 400) {
      metaNumber += 10;
    } else if (this.artwork.abstract.length) {
      metaNumber += 3;
    }
    if (!this.artwork.genres.length) {
      metaNumber += this.artwork.genres.length > 3 ? this.artwork.genres.length : 3;
    }
    if (!this.artwork.materials.length) {
      metaNumber += this.artwork.materials.length > 3 ? this.artwork.genres.length : 3;
    }
    if (!this.artwork.movements.length) {
      metaNumber += this.artwork.movements.length > 3 ? this.artwork.movements.length : 3;
    }
    if (!this.artwork.motifs.length) {
      metaNumber += this.artwork.motifs.length > 3 ? this.artwork.motifs.length : 3;
    }
    if (this.artwork.height && this.artwork.width) {
      metaNumber += 3;
    }

    if (metaNumber < 10) {
      this.collapseDetails = false;
    }
    console.log(this.collapseDetails, metaNumber)
  }

  /**
   * Add tab to artwork tab array
   * @param type Tab title
   * @param icon Tab icon
   * @param active Is active tab
   */
  private addTab(type: EntityType, icon: EntityIcon, active: boolean = false) {
    this.artworkTabs.push({ active, icon, type: type, items: [] });
  }
}
