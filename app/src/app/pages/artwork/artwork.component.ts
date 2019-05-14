import { Component, OnInit, OnDestroy } from '@angular/core';
import { Artwork, Entity } from 'src/app/shared/models/models';
import { takeUntil } from 'rxjs/operators';
import { DataService } from 'src/app/core/services/data.service';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';

/** interface for the tabs */
interface SliderTab {
  heading: string;
  items: Entity[];
  icon: string;
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
  collapseDownTags: boolean = true;

  /** tabs with artwork sliders */
  artworkTabs: { [key: string]: SliderTab } = {
    all: {
      heading: 'All',
      items: [],
      icon: 'list-ul',
      active: true,
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
    motif: {
      heading: 'Motif',
      items: [],
      icon: 'image',
      active: false,
    },
  };

  constructor(private dataService: DataService, private route: ActivatedRoute) {}

  /** hook that is executed at component initialization */
  ngOnInit() {
    /** Extract the id of entity from URL params. */
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe(async (params) => {
      const artworkId = params.get('artworkId');
      /** Use data service to fetch entity from database */
      this.artwork = (await this.dataService.findById(artworkId)) as Artwork;

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

      // testing purpose
      let tempArray = []
      for (let index = 0; index < 4; index++) { 
        for (let key of Object.keys(this.artworkTabs)) {
          if (key == 'all') {
            continue;
          }
          if (this.artworkTabs[key].items && this.artworkTabs[key].items[index]) {
            tempArray.push(this.artworkTabs[key].items[index]);           
          }
        }
      }
      this.artworkTabs.all.items = tempArray;

      });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  toggleDetails() {
    this.collapseDown = !this.collapseDown;
  }

  toggleCommonTags() {
    this.collapseDownTags = !this.collapseDownTags;
  }

  showTab(key: string){
    if (this.artwork) {
      switch (key) {
        case 'artist':
          return this.artwork.creators.length;
        case 'movement':
          return this.artwork.movements.length;
        case 'genre':
          return this.artwork.genres.length;
        case 'motif':
          return this.artwork.depicts.length;
        case 'location':
          return this.artwork.locations.length;
        case 'material':
          return this.artwork.materials.length;
        default:
          return true;
      }
    }
  }
}
