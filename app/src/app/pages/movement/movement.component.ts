import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataService } from 'src/app/core/services/data.service';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Movement, Artwork, EntityType } from 'src/app/shared/models/models';
import { Subject } from 'rxjs';
import * as _ from "lodash";
import { shuffle } from 'src/app/core/services/utils.service';

@Component({
  selector: 'app-movement',
  templateUrl: './movement.component.html',
  styleUrls: ['./movement.component.scss'],
})
export class MovementComponent implements OnInit, OnDestroy {
  /** use this to end subscription to url parameter in ngOnDestroy */
  private ngUnsubscribe = new Subject();

  /** The entity this page is about */
  movement: Movement = null;

  /** Related artworks */
  sliderItems: Artwork[] = [];

  /** Change collapse icon; true if more infos are folded in */
  collapse = true;

  /** Toggle bool for displaying either timeline or artworks carousel component **/
  private showTimelineNotArtworks = true;

  constructor(private dataService: DataService, private route: ActivatedRoute) {
  }

  /** hook that is executed at component initialization */
  ngOnInit() {
    /** Extract the id of entity from URL params. */
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe(async (params) => {
      const movementId = params.get('movementId');

      /** Use data service to fetch entity from database */
      this.movement = await this.dataService.findById<Movement>(movementId, EntityType.MOVEMENT);

      /** load slider items */
      await this.dataService.findArtworksByType("movements", [this.movement.id])
        .then(artworks => this.sliderItems = shuffle(artworks));

      /** dereference influenced_bys  */
      this.dataService.findMultipleById(this.movement.influenced_by as any, EntityType.ARTIST)
        .then(influences => this.movement.influenced_by = influences);

      this.calculateCollapseState();
    });
  }

  toggleDetails() {
    this.collapse = !this.collapse;
  }

  private calculateCollapseState() {
    let metaNumber = 0;
    if (this.movement.abstract.length > 400) {
      metaNumber += 10;
    } else if (this.movement.abstract.length) {
      metaNumber += 3;
    }
    if (!_.isEmpty(this.movement.influenced_by)) {
      metaNumber += 3;
    }
    this.collapse = metaNumber >= 10;
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  toggleComponent() {
    this.showTimelineNotArtworks = !this.showTimelineNotArtworks;
  }
}
