import { Component, OnInit, OnDestroy } from '@angular/core';
import { Artwork, EntityType, Entity, EntityIcon, ArtSearch } from 'src/app/shared/models/models';
import { DataService } from 'src/app/core/services/data.service';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

/**
 * @description Interface for the search results.
 * @export
 * @interface SearchResult
 */
export interface SearchResult {
  items: Entity[];
  key: EntityType;
  icon: EntityIcon;
}

@Component({
  selector: 'app-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.scss'],
})
export class SearchResultComponent implements OnInit, OnDestroy {
  /** Related artworks */
  sliderItems: Artwork[] = [];

  /**
   * variable of the search results
   * @type {SearchResult[]}
   * @memberof SearchResultComponent
   */
  searchResults: SearchResult[] = [];

  /**
   * specific search terms
   * @type {string[]}
   * @memberof SearchResultComponent
   */
  searchTerms: string[] = [];

  /** use this to end subscription to url parameter in ngOnDestroy */
  private ngUnsubscribe = new Subject();

  constructor(private dataService: DataService, private route: ActivatedRoute) { }

  /** hook that is executed at component initialization */
  ngOnInit() {
    /** Extract the search params from url query params. */
    this.route.queryParams.pipe(takeUntil(this.ngUnsubscribe)).subscribe(async (params) => {
      /** resets search results  */
      this.searchResults = [];
      this.searchTerms = params.term ? Array.isArray(params.term) ? params.term : [params.term] : [];

      if (params.artist)
        this.searchResults.push(await this.getSearchResults(params.artist, EntityType.ARTIST, EntityIcon.ARTIST));
      if (params.movement)
        this.searchResults.push(await this.getSearchResults(params.movement, EntityType.MOVEMENT, EntityIcon.MOVEMENT));
      if (params.genre)
        this.searchResults.push(await this.getSearchResults(params.genre, EntityType.GENRE, EntityIcon.GENRE));
      if (params.motif)
        this.searchResults.push(await this.getSearchResults(params.motif, EntityType.MOTIF, EntityIcon.MOTIF));
      if (params.location)
        this.searchResults.push(await this.getSearchResults(params.location, EntityType.LOCATION, EntityIcon.LOCATION));
      if (params.material)
        this.searchResults.push(await this.getSearchResults(params.material, EntityType.MATERIAL, EntityIcon.MATERIAL));

      this.sliderItems = await this.getSliderItems(this.searchResults, this.searchTerms);
    });
  }

  /**
   * Get multiple entities by ids. Return search result object.
   * @param ids id arrays
   * @param type filter by type
   * @param icon icon for SearchResult.
   */
  private async getSearchResults<T>(ids: [], type: EntityType, icon: EntityIcon): Promise<SearchResult> {
    const items = await this.dataService.findMultipleById<T>([].concat(ids), type) as any[];
    return { items, icon, key: type }
  }

  /**
   * Serach artworks by ids and terms
   * Return arwork array
   * @param results search result array
   * @param terms terms array
   */
  private async getSliderItems(results: SearchResult[], terms: string[]): Promise<Artwork[]> {
    const search: ArtSearch = {};
    results.forEach(typeArray => search[typeArray.key + "s"] = typeArray.items.map((e: Entity) => e.id));
    return await this.dataService.findArtworksByCategories(search, terms);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
