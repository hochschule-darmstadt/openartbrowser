import { Component, OnDestroy, OnInit } from '@angular/core';
import { ArtSearch, Artwork, Entity, EntityIcon, EntityType } from 'src/app/shared/models/models';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DataService } from 'src/app/core/services/elasticsearch/data.service';
import { Angulartics2 } from 'angulartics2';
import { usePlural } from 'src/app/shared/models/entity.interface';

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
}

@Component({
  selector: 'app-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.scss']
})
export class SearchResultComponent implements OnInit, OnDestroy {
  /** Related artworks */
  searchResults: Artwork[] = [];

  /**
   * @description for the tabs in slider/carousel.
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
      this.searchResults = await this.getSearchResults(this.searchObjects, this.searchTerms);

      this.angulartics2.eventTrack.next({
        action: 'trackSiteSearch',
        properties: {
          category: 'Search page',
          keyword: this.searchTerms.toString(),
          searchCount: this.searchResults.length
        }
      });
    });
    // All tab should be added by default and set active
    this.addTab(EntityType.ALL, true);

    /**
     * Look in elasticSearch if results exist for current query and depending on result add a tab for it
     */
    Object.values(EntityType).forEach(async type => {
      if (type === 'all') { // skip all-type
        return;
      }
      const results = await this.getSearchResults(this.searchObjects, this.searchTerms, true, type);
      if (results) {
        this.addTab(type);
      }
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
  private async getSearchResults(results: SearchObject[], terms: string[], returnCountOnly = false, type = null): Promise<Artwork[]> {
    const search: ArtSearch = {};
    results.forEach(typeArray => (search[usePlural(typeArray.key)] = typeArray.items.map((e: Entity) => e.id)));
    if (returnCountOnly) {
      return await this.dataService.countSearchResultItems(search, terms, type);
    } else {
      return await this.dataService.searchArtworks(search, terms);
    }
  }

  /**
   * Add tab to entity tab array
   * @param type Tab title
   * @param itemsFound If Items where found in elastic search
   * @param active Is active tab
   */
  private addTab(type: EntityType, active: boolean = false) {
    this.entityTabs.push({
      active,
      icon: EntityIcon[type.toUpperCase()],
      type
    });
  }

  tabClicked(tabClicked: EntityTab) {

  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

