import {Component, OnInit, OnDestroy} from '@angular/core';
import {DataService} from 'src/app/core/services/elasticsearch/data.service';
import {ActivatedRoute} from '@angular/router';
import {takeUntil} from 'rxjs/operators';
import {Movement, Artwork, EntityType} from 'src/app/shared/models/models';
import {Subject} from 'rxjs';
import {shuffle} from 'src/app/core/services/utils.service';

enum Tab {
  Artworks,
  Timeline,
  MovementOverview
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
  activeTab: Tab = Tab.Timeline;

  /** use this to end subscription to url parameter in ngOnDestroy */
  private ngUnsubscribe = new Subject();

  /** The entity this page is about */
  movement: Movement = null;

  /** Related artworks */
  sliderItems: Artwork[] = [];

  /** Toggle bool for displaying either timeline or artworks carousel component */
  movementOverviewLoaded = false;

  /** a video was found */
  videoExists = false;
  /* List of unique Videos */
  uniqueEntityVideos: string[] = [];

  relatedMovements: Movement[] = [];

  constructor(private dataService: DataService, private route: ActivatedRoute) {
  }

  /** hook that is executed at component initialization */
  ngOnInit() {
    this.route.params.subscribe(() => {
      this.videoExists = false;
      this.uniqueEntityVideos = [];
    });
    /** Extract the id of entity from URL params. */
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe(async params => {
      const movementId = params.get('movementId');

      /** Use data service to fetch entity from database */
      this.movement = await this.dataService.findById<Movement>(movementId, EntityType.MOVEMENT);
      if (this.movement.videos && this.movement.videos.length > 0) {
        this.uniqueEntityVideos.unshift(this.movement.videos[0]);
      }

      /** load slider items */
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
          this.sliderItems = shuffle(artworks);
          this.addUniqueVideos();
        });

      /** dereference influenced_bys  */
      this.dataService.findMultipleById(this.movement.influenced_by as any, EntityType.ARTIST)
        .then(influences => (this.movement.influenced_by = influences));

      /** get is part movements */
      let movements = await this.dataService.getHasPartMovements(movementId);
      this.relatedMovements.push(...movements);

      /** get part of movements */
      movements = await this.dataService.getPartOfMovements(movementId);
      this.relatedMovements.push(...movements);

      if (this.relatedMovements.length >= 1 && this.movement.start_time && this.movement.end_time) {
        this.relatedMovements.push(this.movement);
      }
    });
  }

  setActiveTab(tab: Tab) {
    this.activeTab = tab;

    if (this.activeTab === Tab.MovementOverview) {
      this.movementOverviewLoaded = true;
    }
  }

  addUniqueVideos() {
    for ( const entity of this.sliderItems) {
      if (entity.videos && entity.videos.length >  0 && !this.uniqueEntityVideos.includes(entity.videos[0])) {
        this.uniqueEntityVideos.push(entity.videos[0]);
      }
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }


  videoFound(event) {
    this.videoExists = this.videoExists ? true : event;
  }
}
