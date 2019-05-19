import { Component, OnInit, OnDestroy } from '@angular/core';
import { Artwork, Entity } from 'src/app/shared/models/models';
import { takeUntil } from 'rxjs/operators';
import { DataService } from 'src/app/core/services/data.service';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import * as _ from "lodash";

/** interface for the tabs */
interface SliderTab {
  heading: string;
  items: Entity[];
  active: boolean;
}

@Component({
  selector: 'app-artwork',
  templateUrl: './artwork.component.html',
  styleUrls: ['./artwork.component.scss'],
})
export class ArtworkComponent implements OnInit, OnDestroy {
  /** use this to end subscription to url parameter in ngOnDestroy */
  private ngUnsubscribe = new Subject();

  Object = Object;

  /** The entity this page is about */
  artwork: Artwork = null;

  /** Change collapse icon */
  collapseDown: boolean = true;

  /** tabs with artwork sliders */
  artworkTabs: { [key: string]: SliderTab } = {
    all: {
      heading: 'All',
      items: [],
      active: true,
    },
    artist: {
      heading: 'Artist',
      items: [],
      active: false,
    },
    location: {
      heading: 'Location',
      items: [],
      active: false,
    },
    genre: {
      heading: 'Genre',
      items: [],
      active: false,
    },
    movement: {
      heading: 'Movement',
      items: [],
      active: false,
    },
    material: {
      heading: 'Material',
      items: [],
      active: false,
    },
    motif: {
      heading: 'Motif',
      items: [],
      active: false,
    },
  };

  constructor(private dataService: DataService, private route: ActivatedRoute) { }

  /** hook that is executed at component initialization */
  ngOnInit() {
    /** Extract the id of entity from URL params. */
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe(async (params) => {
      const artworkId = params.get('artworkId');
      /** Use data service to fetch entity from database */
      this.artwork = (await this.dataService.findById(artworkId)) as Artwork;

      /* Count meta data to show more on load */
      this.countMetaData();
      console.log(`metadata size: ${this.metaNumber}`);
      if (this.metaNumber < 3)
        this.collapseDown = false;

      this.artworkTabs.artist.items = await this.dataService.findArtworksByArtists(
        this.artwork.creators.map((creator) => {
          return creator.id;
        })
      );
      this.artworkTabs.location.items = await this.dataService.findArtworksByLocations(
        this.artwork.locations.map((location) => {
          return location.id;
        })
      );
      this.artworkTabs.genre.items = await this.dataService.findArtworksByGenres(
        this.artwork.genres.map((genre) => {
          return genre.id;
        })
      );
      this.artworkTabs.movement.items = await this.dataService.findArtworksByMovements(
        this.artwork.movements.map((movement) => {
          return movement.id;
        })
      );
      this.artworkTabs.material.items = await this.dataService.findArtworksByMaterials(
        this.artwork.materials.map((material) => {
          return material.id;
        })
      );
      this.artworkTabs.motif.items = await this.dataService.findArtworksByMotifs(
        this.artwork.depicts.map((motif) => {
          return motif.id;
        })
      );

      this.selectAllTabItems(4);
    });
  }

  /** select items for all tab by taking items from every tab and shuffling them together */
  selectAllTabItems(maxAmountFromEachTab: number) {
    /** use map to filter duplicates */
    const allTabItems = new Map<string, Entity>();
    /** loop through artwork tabs  */
    for (const tab of Object.keys(this.artworkTabs)) {
      /** shuffle tab items of selected artwork tabs */
      const shuffledTabItems = this.artworkTabs[tab].items.sort(() => 0.5 - Math.random());
      /** defines how many items are selected from this tab that should go into all tab */
      const itemAmountFromThisTab =
        shuffledTabItems.length > maxAmountFromEachTab ? maxAmountFromEachTab : shuffledTabItems.length;
      // get that many items from the shuffled items and put them into all tab items
      const selected = shuffledTabItems.slice(0, itemAmountFromThisTab);
      for (const item of selected) {
        allTabItems.set(item.label, item);
      }
    }
    let items: Entity[] = Array.from(allTabItems.values());
    /** shuffle allTabs items once more */
    items = items.sort(() => 0.5 - Math.random());
    this.artworkTabs.all.items = items;
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  toggleDetails() {
    this.collapseDown = !this.collapseDown;
  }

  metaNumber: number = 0;

  countMetaData() {
    if (!_.isEmpty(this.artwork.genres))
      this.metaNumber++;
    if (!_.isEmpty(this.artwork.materials))
      this.metaNumber++;
    if (!_.isEmpty(this.artwork.movements))
      this.metaNumber++;
    if (!_.isEmpty(this.artwork.depicts))
      this.metaNumber++;
    if ((!_.isEmpty(this.artwork.height)) && (!_.isEmpty(this.artwork.width)))
      this.metaNumber++;
  }
}
