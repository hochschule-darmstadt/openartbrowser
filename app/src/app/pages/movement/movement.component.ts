import {Component, OnInit, OnDestroy} from '@angular/core';
import {DataService} from 'src/app/core/services/elasticsearch/data.service';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {takeUntil} from 'rxjs/operators';
import {Movement, Artwork, EntityType, Entity} from 'src/app/shared/models/models';
import {Subject} from 'rxjs';
import {shuffle} from 'src/app/core/services/utils.service';
import {FetchOptions} from "../../shared/components/fetching-list/fetching-list.component";
import {Location} from "@angular/common";
import {UrlParamService} from "../../core/services/urlparam.service";

enum Tab {
  Artworks = 'artworks',
  Timeline = 'timeline',
  MovementOverview = 'movements'
}

@Component({
  selector: 'app-movement',
  templateUrl: './movement.component.html',
  styleUrls: ['./movement.component.scss']
})

export class MovementComponent implements OnInit, OnDestroy {
  /* TODO:REVIEW
     Similarities in every page-Component:
     - variables: ngUnsubscribe, collapse, sliderItems, dataService, route
     - ngOnDestroy, calculateCollapseState, ngOnInit

     1. Use Inheritance (Root-Page-Component) or Composition
     2. Inject entity instead of movement
   */
  Tab = Tab;
  activeTab: string = Tab.Timeline;

  /** use this to end subscription to url parameter in ngOnDestroy */
  private ngUnsubscribe = new Subject();

  /** The entity this page is about */
  movement: Movement = null;

  idDoesNotExist = false;
  movementId: string;

  /** Related artworks */
  fetchOptions = {
    initOffset: 0,
    fetchSize: 30,
    queryCount: undefined,
    entityType: EntityType.ARTWORK
  } as FetchOptions;
  query: (offset: number) => Promise<Entity[]>;

  /** Timeline artworks */
  timelineItems: Artwork[] = [];

  /** Toggle bool for displaying either timeline or artworks carousel component */
  movementOverviewLoaded = false;

  /** a video was found */
  videoExists = false;
  /* List of unique Videos */
  uniqueEntityVideos: string[] = [];

  relatedMovements: Movement[] = [];

  constructor(private dataService: DataService, private route: ActivatedRoute, private router: Router,
              private location: Location, private urlParamService: UrlParamService) {

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
      this.movementId = params.get('movementId');
      // Reset attributes
      this.relatedMovements = [];

      this.fetchOptions.queryCount = this.dataService.countArtworksByType(EntityType.MOVEMENT, [this.movementId]);

      /** load fetching list items */
      this.query = async (offset) => {
        return await this.dataService.findArtworksByType(
          EntityType.MOVEMENT, [this.movementId], this.fetchOptions.fetchSize, offset)
      };

      /** Use data service to fetch entity from database */
      this.movement = await this.dataService.findById<Movement>(this.movementId, EntityType.MOVEMENT);

      if (!this.movement) {
        this.idDoesNotExist = true;
        return; 
      }

      if (this.movement.videos && this.movement.videos.length > 0) {
        this.uniqueEntityVideos.unshift(this.movement.videos[0]);
      }

      /** load timeline items */
      await this.dataService.findArtworksByType(EntityType.MOVEMENT, [this.movement.id])
        .then(artworks => {
          const referenceStartTime = this.movement.start_time || this.movement.start_time_est || -1;
          const referenceEndTime = this.movement.end_time || this.movement.end_time_est || -1;
          if (referenceStartTime !== -1) {
            artworks = artworks.filter(artwork => artwork.inception >= referenceStartTime);
          }
          if (referenceEndTime !== -1) {
            artworks = artworks.filter(artwork => artwork.inception <= referenceEndTime);
          }
          this.timelineItems = shuffle(artworks);
          this.addUniqueVideos();
        });

      /** dereference influenced_bys  */
      this.dataService.findMultipleById(this.movement.influenced_by as any, EntityType.ARTIST)
        .then(influences => (this.movement.influenced_by = influences));

      /** get is part movements */
      let movements = await this.dataService.getHasPartMovements(this.movementId);
      this.relatedMovements.push(...movements);

      /** get part of movements */
      movements = await this.dataService.getPartOfMovements(this.movementId);
      this.relatedMovements.push(...movements);

      if (this.relatedMovements.length >= 1 && this.movement.start_time && this.movement.end_time) {
        this.relatedMovements.push(this.movement);
      }

      // trigger onChanges lifecycle method of movement-overview
      this.relatedMovements = this.relatedMovements.slice();
    });
  }

  setActiveTab(tab: Tab) {
    if (!Object.values(Tab).includes(tab)) {
      tab = Tab.Timeline;
    }
    let queryParams: Params = {tab: tab};

    if (tab != Tab.Artworks) {
      queryParams.page = null;
    }
    this.urlParamService.changeQueryParams(queryParams).resolve();

    if (tab === Tab.MovementOverview) {
      this.movementOverviewLoaded = true;
    }
    this.activeTab = tab;
  }

  addUniqueVideos() {
    for (const entity of this.timelineItems) {
      if (entity.videos && entity.videos.length > 0 && !this.uniqueEntityVideos.includes(entity.videos[0])) {
        this.uniqueEntityVideos.push(entity.videos[0]);
      }
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.urlParamService.changeQueryParams({tab: null}).resolve();
  }


  videoFound(event) {
    this.videoExists = this.videoExists ? true : event;
  }
}
