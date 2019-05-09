import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/core/services/data.service';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Movement, Artwork } from 'src/app/shared/models/models';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-movement',
  templateUrl: './movement.component.html',
  styleUrls: ['./movement.component.scss'],
})
export class MovementComponent implements OnInit {
  /** use this to end subscription to url parameter in ngOnDestroy */
  private ngUnsubscribe = new Subject();

  /** The entity this page is about */
  movement: Movement = null;

  /** Related artworks */
  sliderItems: Artwork[] = [];

  constructor(private dataService: DataService, private route: ActivatedRoute) {}

  /** hook that is executed at component initialization */
  ngOnInit() {
    /** Extract the id of entity from URL params. */
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe(async (params) => {
      const movementId = params.get('movementId');
      /** Use data service to fetch entity from database */
      this.movement = (await this.dataService.findById(movementId)) as Movement;
      this.sliderItems = await this.dataService.findArtworksByMovements([this.movement.id]);
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
