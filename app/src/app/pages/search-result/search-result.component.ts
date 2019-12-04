import { Component, OnInit, OnDestroy } from '@angular/core';
import { Artwork, EntityType, Artist, Location, Movement, Genre, Material, Motif } from 'src/app/shared/models/models';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DataService } from 'src/app/core/services/elasticsearch/data.service';

@Component({
  selector: 'app-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.scss'],
})
export class SearchResultComponent implements OnInit, OnDestroy {
  /** Related artworks */
  sliderItems: Artwork[] = [];

  motifArray: Motif[] = [];
  artistArray: Artist[] = [];
  movementArray: Movement[] = [];
  locationArray: Location[] = [];
  genreArray: Genre[] = [];
  materialArray: Material[] = [];
  searchTerms: string[] = [];

  /** use this to end subscription to url parameter in ngOnDestroy */
  private ngUnsubscribe = new Subject();

  constructor(private dataService: DataService, private route: ActivatedRoute) { }

  /** resets search results  */
  resetSearchResults() {
    this.motifArray = [];
    this.artistArray = [];
    this.movementArray = [];
    this.locationArray = [];
    this.genreArray = [];
    this.materialArray = [];
    this.searchTerms = [];
  }

  /** hook that is executed at component initialization */
  ngOnInit() {
    /** Extract the search params from url query params. */
    this.route.queryParams.pipe(takeUntil(this.ngUnsubscribe)).subscribe(async (params) => {
      this.resetSearchResults();
      this.searchTerms = params.term ? [].concat(params.term) : [];

      if (params.artist) {
        this.artistArray = await this.dataService.findMultipleById([].concat(params.artist), EntityType.ARTIST);
      }
      if (params.movement) {
        this.movementArray = await this.dataService.findMultipleById([].concat(params.movement), EntityType.MOVEMENT);
      }
      if (params.genre) {
        this.genreArray = await this.dataService.findMultipleById([].concat(params.genre), EntityType.GENRE);
      }
      if (params.motif) {
        this.motifArray = await this.dataService.findMultipleById([].concat(params.motif), EntityType.MOTIF);
      }
      if (params.location) {
        this.locationArray = await this.dataService.findMultipleById([].concat(params.location), EntityType.LOCATION);
      }
      if (params.material) {
        this.materialArray = await this.dataService.findMultipleById([].concat(params.material), EntityType.MATERIAL);
      }
      await this.getSearchResults();
    });
  }

  /** fetch search results */
  async getSearchResults() {
    this.sliderItems = await this.dataService.searchArtworks(
        {
          artists: this.artistArray.map((artist) => artist.id),
          motifs: this.motifArray.map((motif) => motif.id),
          movements: this.movementArray.map((movement) => movement.id),
          locations: this.locationArray.map((loc) => loc.id),
          genres: this.genreArray.map((genre) => genre.id),
          materials: this.materialArray.map((material) => material.id)
        },
        this.searchTerms
      )
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
