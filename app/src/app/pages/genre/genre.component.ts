import {Component, OnInit, OnDestroy} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import {Genre, EntityType, Entity} from 'src/app/shared/models/models';
import { Subject } from 'rxjs';
import { DataService } from 'src/app/core/services/elasticsearch/data.service';
import {FetchOptions} from "../../shared/components/fetching-list/fetching-list.component";

@Component({
  selector: 'app-genre',
  templateUrl: './genre.component.html',
  styleUrls: ['./genre.component.scss']
})
export class GenreComponent implements OnInit, OnDestroy {
  /* TODO:REVIEW
  Similiarities in every page-Component:
  - variables: ngUnsubscribe, collapse, sliderItems, dataService, route
  - ngOnDestroy, calculateCollapseState, ngOnInit

  1. Use Inheritance (Root-Page-Component) or Composition
  2. Inject entity instead of genre
  */

  /** use this to end subscription to url parameter in ngOnDestroy */
  private ngUnsubscribe = new Subject();

  /** The entity this page is about */
  genre: Genre = null;

  /** Related artworks */
  fetchOptions = {
    initOffset: 0,
    fetchSize: 30,
    queryCount: undefined,
    entityType: EntityType.ARTWORK
  } as FetchOptions;
  query: (offset: number) => Promise<Entity[]>;

  constructor(private dataService: DataService, private route: ActivatedRoute) {}

  /** hook that is executed at component initialization */
  ngOnInit() {
    /** Extract the id of entity from URL params. */
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe(async params => {
      const genreId = params.get('genreId');
      this.fetchOptions.queryCount = this.dataService.countArtworksByType(EntityType.GENRE, [genreId]);

      /** load fetching list items */
      this.query = async (offset) => {
        return await this.dataService.findArtworksByType(
          EntityType.GENRE, [genreId], this.fetchOptions.fetchSize, offset)
      };

      /** Use data service to fetch entity from database */
      this.genre = await this.dataService.findById<Genre>(genreId, EntityType.GENRE);
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    window.onscroll = undefined;
  }
}
