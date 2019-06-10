import { Component, OnInit, OnDestroy } from '@angular/core';
import { Artist, Artwork, EntityType } from 'src/app/shared/models/models';
import { DataService } from 'src/app/core/services/data.service';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import * as _ from 'lodash';

@Component({
  selector: 'app-artist',
  templateUrl: './artist.component.html',
  styleUrls: ['./artist.component.scss'],
})
export class ArtistComponent implements OnInit, OnDestroy {
  /** use this to end subscription to url parameter in ngOnDestroy */
  private ngUnsubscribe = new Subject();

  /** The entity this page is about */
  artist: Artist = null;

  /** Related artworks */
  sliderItems: Artwork[] = [];

  /** Change collapse icon */
  collapseDown: boolean = true;

  /** score of meta data size */
  metaNumber: number = 0;

  constructor(private dataService: DataService, private route: ActivatedRoute) { }

  toggleDetails() {
    this.collapseDown = !this.collapseDown;
  }

  /** hook that is executed at component initialization */
  ngOnInit() {
    /** Extract the id of entity from URL params. */
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe(async (params) => {
      const artistId = params.get('artistId');
      /** Use data service to fetch entity from database */
      this.artist = await this.dataService.findById<Artist>(artistId, EntityType.ARTIST);

      /** load slider items */
      this.dataService.findArtworksByArtists([this.artist.id]).then((artworks) => {
        this.sliderItems = artworks;
      });
      /** dereference movements  */
      this.dataService.findMultipleById(this.artist.movements as any, EntityType.MOVEMENT).then((movements) => {
        this.artist.movements = movements;
      });
      /** dereference influenced_bys */
      this.dataService.findMultipleById(this.artist.influenced_by as any, EntityType.ARTIST).then((influences) => {
        this.artist.influenced_by = influences;
      });

      /* Count meta data to show more on load */

      this.calculateCollapseState();

    });
  }

  /** calculates the size of meta data item section
   * every attribute: +3
   * if attribute is array and size > 3 -> + arraylength
   */
  calculateCollapseState() {
    this.collapseDown = true;
    // TODO it's always good to have IF(){ close bracket }
    if (!this.artist.gender)
      this.metaNumber += 3;
    if (!_.isEmpty(this.artist.influenced_by))
      this.metaNumber += this.artist.influenced_by.length > 3 ? this.artist.influenced_by.length : 3;
    if (!_.isEmpty(this.artist.movements))
      this.metaNumber += this.artist.movements.length > 3 ? this.artist.movements.length : 3;
    if (!_.isEmpty(this.artist.citizenship))
      this.metaNumber += 3;
    if (this.metaNumber < 10) {
      this.collapseDown = false;
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
