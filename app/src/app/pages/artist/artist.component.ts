import {Component, OnDestroy, OnInit} from '@angular/core';
import {Artist, Artwork, Entity, EntityType, Movement} from 'src/app/shared/models/models';
import {DataService} from 'src/app/core/services/elasticsearch/data.service';
import {ActivatedRoute, Params} from '@angular/router';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import * as _ from 'lodash';
import {shuffle} from 'src/app/core/services/utils.service';
import {FetchOptions} from '../../shared/components/fetching-list/fetching-list.component';
import {UrlParamService} from '../../core/services/urlparam.service';

enum Tab {
  Artworks = 'artworks',
  Timeline = 'timeline',
}

@Component({
  selector: 'app-artist',
  templateUrl: './artist.component.html',
  styleUrls: ['./artist.component.scss']
})
export class ArtistComponent implements OnInit, OnDestroy {
  /* TODO:REVIEW
    Similiarities in every page-Component:
    - variables: ngUnsubscribe, collapse, sliderItems, dataService, route
    - ngOnDestroy, calculateCollapseState, ngOnInit

    1. Use Inheritance (Root-Page-Component) or Composition
    2. Inject entity instead of artist
  */

  /** The entity this page is about */
  artist: Artist = null;
  /** Timeline artworks */
  sliderItems: Artwork[] = [];

  idDoesNotExist = false;
  artistId: string;

  /** Related artworks */
  fetchOptions = {
    initOffset: 0,
    fetchSize: 30,
    queryCount: undefined,
    entityType: EntityType.ARTWORK
  } as FetchOptions;
  query: (offset: number) => Promise<Entity[]>;


  /** use this to end subscription to url parameter in ngOnDestroy */
  private ngUnsubscribe = new Subject<void>();

  /** Toggle bool for displaying either timeline or artworks carousel component */
  Tab = Tab;
  activeTab: string = Tab.Timeline;

  /** a video was found */
  videoExists = false;
  /* List of unique Videos */
  uniqueEntityVideos: string[] = [];

  constructor(private dataService: DataService, private route: ActivatedRoute, private urlParamService: UrlParamService) {
  }

  /** hook that is executed at component initialization */
  ngOnInit() {
    this.route.params.subscribe(() => {
      this.videoExists = false;
      this.uniqueEntityVideos = [];
    });
    const queryParamMap = this.route.snapshot.queryParamMap;
    if (queryParamMap.get('page')) {
      this.setActiveTab(Tab.Artworks);
    } else {
      this.setActiveTab(Tab[queryParamMap.get('tab')]);
    }


    /** Extract the id of entity from URL params. */
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe(async params => {
      this.artistId = params.get('artistId');

      this.fetchOptions.queryCount = this.dataService.countArtworksByType(EntityType.ARTIST, [this.artistId]);

      /** load fetching list items */
      this.query = async (offset) => {
        return await this.dataService.findArtworksByType(
          EntityType.ARTIST, [this.artistId], this.fetchOptions.fetchSize, offset);
      };

      /** Use data service to fetch entity from database */
      this.artist = await this.dataService.findById<Artist>(this.artistId, EntityType.ARTIST);

      if (!this.artist) {
        this.idDoesNotExist = true;
        return;
      }

      if (this.artist.videos && this.artist.videos.length > 0) {
        this.uniqueEntityVideos.unshift(this.artist.videos[0]);
      }

      this.dataService.findArtworksByType(EntityType.ARTIST, [this.artist.id])
        .then(artworks => (this.sliderItems = shuffle(artworks)));
      /** dereference movements  */
      this.dataService.findMultipleById(this.artist.movements as any, EntityType.MOVEMENT)
        .then(movements => (this.artist.movements = movements));
      /** dereference influenced_bys */
      this.dataService.findMultipleById(this.artist.influenced_by as any, EntityType.ARTIST)
        .then(influences => (this.artist.influenced_by = influences));

      /* Count meta data to show more on load */
      this.aggregatePictureMovementsToArtist();
    });
  }

  /*
    Iterates over the movements and adds all videos to uniqueEntityVideos.
    Only Videos whose id and link are not in uniqueEntityVideos & uniqueVideosLinks will be added.
  */
  addMovementVideos() {
    for (const movement of this.artist.movements) {
      if (movement.videos && movement.videos.length > 0 && !this.uniqueEntityVideos.includes(movement.videos[0])) {
        this.uniqueEntityVideos.push(movement.videos[0]);
      }
    }
  }

  /**
   * Get all movements from the artworks of an artist and add them to the artist movements.
   * Since the first query only gives back the movement id and not the complete movement object,
   * it needs to be queried again to get the corresponding movement object.
   * Since the movements are added as arrays of arrays the deletion of duplicate movements is done at the end.
   */
  private async aggregatePictureMovementsToArtist() {
    const allMovements: Partial<Movement>[] = [];
    this.dataService.findArtworksByType(EntityType.ARTIST, [this.artist.id]).then(artworks => {
      artworks.forEach(artwork => {
          artwork.movements.forEach(movement => {
          if (movement && (movement as any) !== '') {
            allMovements.push(movement);
            this.addMovementVideos();
          }
        });
      });
      this.dataService.findMultipleById(allMovements as any, EntityType.MOVEMENT).then(movements => {
        movements.forEach(movement => {
          this.artist.movements.push(movement);
        });
        this.artist.movements = _.uniqWith(this.artist.movements, _.isEqual);
        this.addMovementVideos();
      });
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next(undefined);
    this.ngUnsubscribe.complete();
    this.urlParamService.changeQueryParams({tab: null}).resolve();
  }

  setActiveTab(tab: Tab) {
    if (!Object.values(Tab).includes(tab)) {
      tab = Tab.Timeline;
    }
    const queryParams: Params = {tab: tab};

    if (tab != Tab.Artworks) {
      queryParams.page = null;
    }
    this.urlParamService.changeQueryParams(queryParams).resolve();
    this.activeTab = tab;
  }

  videoFound(event) {
    this.videoExists = this.videoExists ? true : event;
  }

  onChange(event){
    const value = event.target.value
    if(value=="timeline"){
      this.setActiveTab(Tab.Timeline)
    }
    else{
      this.setActiveTab(Tab.Artworks)
    }
  }
}



  


