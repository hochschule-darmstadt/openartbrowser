import { Component, OnDestroy, OnInit } from '@angular/core';
import { ArtSearch, Artwork, Entity, EntityIcon, EntityType } from 'src/app/shared/models/models';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DataService } from 'src/app/core/services/elasticsearch/data.service';
import { Angulartics2 } from 'angulartics2';
import { usePlural } from 'src/app/shared/models/entity.interface';
import { FetchOptions } from '../../shared/components/fetching-list/fetching-list.component';

/**
 * @description Interface for the search results.
 * @export
 */
export interface SearchObject {
  items: Entity[];
  key: EntityType;
  icon: EntityIcon;
}

/** interface for the tabs */
interface EntityTab {
  type: EntityType;
  icon: EntityIcon;
  active: boolean;
  query: (offset: number) => Promise<Entity[]>;
  fetchOptions: FetchOptions;
  initialized: boolean;
  loaded: boolean;
}


@Component({
  selector: 'app-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.scss']
})
export class SearchResultComponent implements OnInit, OnDestroy {
  /** Count for search results */
  countResults: number;

  /** Related artworks */
  searchResults: Artwork[] = [];

  /**
   * tabs
   */
  entityTabs: EntityTab[] = [];

  /**
   * variable of the search results
   */
  searchObjects: SearchObject[] = [];

  /**
   * specific search terms
   */
  searchTerms: string[] = [];

  /** use this to end subscription to url parameter in ngOnDestroy */
  private ngUnsubscribe = new Subject();

  constructor(private dataService: DataService, private route: ActivatedRoute, private angulartics2: Angulartics2) {
  }

  /** hook that is executed at component initialization */
  ngOnInit() {
    /** Extract the search params from url query params. */
    this.route.queryParams.pipe(takeUntil(this.ngUnsubscribe)).subscribe(async params => {
      /** resets search results  */
      this.searchObjects = [];
      this.searchTerms = params.term ? (Array.isArray(params.term) ? params.term : [params.term]) : [];
      if (params.artist) {
        this.searchObjects.push(await this.getSearchObjects(params.artist, EntityType.ARTIST, EntityIcon.ARTIST));
      }
      if (params.movement) {
        this.searchObjects.push(await this.getSearchObjects(params.movement, EntityType.MOVEMENT, EntityIcon.MOVEMENT));
      }
      if (params.genre) {
        this.searchObjects.push(await this.getSearchObjects(params.genre, EntityType.GENRE, EntityIcon.GENRE));
      }
      if (params.motif) {
        this.searchObjects.push(await this.getSearchObjects(params.motif, EntityType.MOTIF, EntityIcon.MOTIF));
      }
      if (params.location) {
        this.searchObjects.push(await this.getSearchObjects(params.location, EntityType.LOCATION, EntityIcon.LOCATION));
      }
      if (params.material) {
        this.searchObjects.push(await this.getSearchObjects(params.material, EntityType.MATERIAL, EntityIcon.MATERIAL));
      }
      // TODO: unnecessary afterwads?
      this.searchResults = await this.getSearchResults(this.searchObjects, this.searchTerms);

      /** construct artSearch-Object and pass to every tab */
      const search: ArtSearch = {};
      this.searchObjects.forEach(typeArray => (search[usePlural(typeArray.key)] = typeArray.items.map((e: Entity) => e.id)));

      /** clear tabs for every route parameter change */
      this.entityTabs = [];
      Object.values(EntityType).forEach(type => this.addTab(search, type, type === EntityType.ALL));

      this.loadTabs();

      this.angulartics2.eventTrack.next({
        action: 'trackSiteSearch',
        properties: {
          category: 'Search page',
          keyword: this.searchTerms.toString(),
          searchCount: this.searchResults.length
        }
      });
    });
  }

  /**
   * Get multiple entities by ids. Return search result object.
   * @param ids id arrays
   * @param type filter by type
   * @param icon icon for SearchResult.
   */
  private async getSearchObjects<T>(ids: [], type: EntityType, icon: EntityIcon): Promise<SearchObject> {
    const items = (await this.dataService.findMultipleById<T>([].concat(ids), type)) as any[];
    return { items, icon, key: type };
  }

  /**
   * Serach artworks by ids and terms
   * Return arwork array
   * @param results search result array
   * @param terms terms array
   */
  // TODO: unnecessary afterwards
  private async getSearchResults<T>(results: SearchObject[], terms: string[]): Promise<T[]> {
    const search: ArtSearch = {};
    results.forEach(typeArray => (search[usePlural(typeArray.key)] = typeArray.items.map((e: Entity) => e.id)));
    return await this.dataService.searchArtworks(search, terms);
  }

  private async getSearchResultsCounts(results: SearchObject[], terms: string[], type: EntityType): Promise<number> {
    const search: ArtSearch = {};
    results.forEach(typeArray => (search[usePlural(typeArray.key)] = typeArray.items.map((e: Entity) => e.id)));
    return await this.dataService.countSearchResultItems(search, terms, type);
  }

  private loadTabs() {
    Promise.all(
      /** load related data for each tab  */
      this.entityTabs.map((tab: EntityTab) => {
        this.getSearchResultsCounts(this.searchObjects, this.searchTerms,
          (tab.type === EntityType.ALL) ? null : tab.type).then(itemCount => {
          if (itemCount === 0) {
            this.entityTabs = this.entityTabs.filter(t => t.type !== tab.type);
          } else {
            tab.fetchOptions.queryCount = itemCount;
            if (tab.type === EntityType.ALL) {
              this.countResults = itemCount;
            }
            tab.loaded = true;
          }
        });
      })
    );
  }

  /**
   * Add tab to entity tab array
   * @param search Object with search parameters
   * @param type Tab title
   * @param active Is active tab
   */
  private addTab(search: ArtSearch, type: EntityType, active: boolean = false) {

    /** set fetchOptions and pass to tab later */
    const fetchOptions = {
      initOffset: 0,
      fetchSize: 30,
      queryCount: undefined,
      entityType: type
    } as FetchOptions;

    /** load fetching list items */
    const query = async (offset) => {
      return await this.dataService.searchResultsByType(search, this.searchTerms, fetchOptions.fetchSize, offset, (type === EntityType.ALL) ? null : type);
    };

    this.entityTabs.push({
      active,
      icon: EntityIcon[type.toUpperCase()],
      type,
      fetchOptions,
      query,
      initialized: active,
      loaded: false
    });
  }

  tabClicked(tabClicked: EntityTab) {
    tabClicked.initialized = true;
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

