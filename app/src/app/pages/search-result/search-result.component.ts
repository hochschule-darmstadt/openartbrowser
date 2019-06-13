import { Component, OnInit, OnDestroy } from '@angular/core';
import { Artwork } from 'src/app/shared/models/models';
import { DataService } from 'src/app/core/services/data.service';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.scss'],
})
export class SearchResultComponent implements OnInit, OnDestroy {
  /** Related artworks */
  sliderItems: Artwork[] = [];

  motifArray: string[] = [];
  artistArray: string[] = [];
  movementArray: string[] = [];
  locationArray: string[] = [];
  genreArray: string[] = [];
  materialArray: string[] = [];
  searchTerms: string[] = [];

  /** use this to end subscription to url parameter in ngOnDestroy */
  private ngUnsubscribe = new Subject();

  constructor(private dataService: DataService, private route: ActivatedRoute) { }

  /** hook that is executed at component initialization */
  ngOnInit() {
    /** Extract the search params from url query params. */
    this.route.queryParams.pipe(takeUntil(this.ngUnsubscribe)).subscribe(async (params) => {
      this.searchTerms = params.term ? [].concat(params.term) : [];
      this.artistArray = params.artist ? [].concat(params.artist) : [];
      this.motifArray = params.motif ? [].concat(params.motif) : [];
      this.movementArray = params.movement ? [].concat(params.movement) : [];
      this.locationArray = params.location ? [].concat(params.location) : [];
      this.genreArray = params.genre ? [].concat(params.genre) : [];
      this.materialArray = params.material ? [].concat(params.material) : [];

      await this.getSearchResults();
    });
  }

  /** fetch search results */
  async getSearchResults() {
    this.dataService
      .findArtworksByCategories(
        {
          creators: this.artistArray,
          depicts: this.motifArray,
          movements: this.movementArray,
          locations: this.locationArray,
          genres: this.genreArray,
          materials: this.materialArray,
        },
        this.searchTerms
      )
      .then((items) => {
        this.sliderItems = items;
      });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
