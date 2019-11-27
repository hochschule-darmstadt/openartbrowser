import {Component, OnInit, OnDestroy} from '@angular/core';
import {Artist, Artwork, EntityType, Movement} from 'src/app/shared/models/models';
import {DataService} from 'src/app/core/services/data.service';
import {ActivatedRoute} from '@angular/router';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import * as _ from 'lodash';
import {DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";

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

  /** Change collapse icon; true if more infos are folded in */
  collapse = true;

  /**
   *@description to use sanitized Youtube URL in artist.component.html
   */
  public safeUrl: SafeResourceUrl;

  constructor(private dataService: DataService, private route: ActivatedRoute, public sanitizer: DomSanitizer) {
    this.sanitizer = sanitizer;
  }

  toggleDetails() {
    this.collapse = !this.collapse;
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
        this.sliderItems = this.shuffle(artworks);
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

      /** Get Youtube URL from entity artist.videos*/
      this.getTrustedUrl(this.artist.videos);
    });
  }

  getTrustedUrl(url:any){
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  /**
   * @description shuffle the items' categories.
   */
  shuffle = (a: Artwork[]): Artwork[] => {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /** calculates the size of meta data item section
   * every attribute: +3
   * if attribute is array and size > 3 -> + arraylength
   */
  private calculateCollapseState() {
    let metaNumber = 0;
    if (this.artist.abstract.length > 400) {
      metaNumber += 10;
    } else if (this.artist.abstract.length) {
      metaNumber += 3;
    }
    if (this.artist.gender) {
      metaNumber += 3;
    }
    if (!_.isEmpty(this.artist.influenced_by)) {
      metaNumber += this.artist.influenced_by.length > 3 ? this.artist.influenced_by.length : 3;
    }
    if (!_.isEmpty(this.artist.movements)) {
      metaNumber += this.artist.movements.length > 3 ? this.artist.movements.length : 3;
    }
    if (!_.isEmpty(this.artist.citizenship)) {
      metaNumber += 3;
    }
    if (metaNumber < 10) {
      this.collapse = false;
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
