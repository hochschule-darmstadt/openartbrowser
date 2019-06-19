import { Component, OnInit, AfterViewInit, OnDestroy, Input } from '@angular/core';
import { interval, Observable, Subject } from 'rxjs';
import { DataService } from 'src/app/core/services/data.service';
import { Router } from '@angular/router';
import { debounceTime, switchMap, takeUntil } from 'rxjs/operators';
import { TagItem, Entity } from '../../models/models';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit, OnDestroy, AfterViewInit {
  /**
   * @description input for search component
   */
  searchInput: string;

  /**
   * @description simple check to prep tag for removal
   */
  rmTag: boolean = false;

  /** whether search is header or home page */
  @Input()
  isHeaderSearch = false;

  /**
   * @description Array of all chips.
   */
  searchItems: TagItem[] = [];

  /**
   * @description String value binding the placeholder in the searchbar.
   * @type string
   * @memberof SearchComponent
   */
  placeholderText: string;

  /**
   * @description Array of all placeholder values.
   * @type string[]
   * @memberof SearchComponent
   */
  placeholderArray: string[] = [
    'Search for something...',
    'Try "Mona Lisa"',
    'Try "Vincent van Gogh"',
    'Try "Renaissance"',
  ];

  /**
   * @description Counter of placeholderArray.
   * @memberof SearchComponent
   */
  counter = 0;

  isSearching = false;

  /** use this to end subscription to url parameter in ngOnDestroy */
  private ngUnsubscribe = new Subject();

  constructor(private dataService: DataService, private router: Router) { }

  ngOnInit() {
    this.dataService.$searchItems.pipe(takeUntil(this.ngUnsubscribe)).subscribe((items) => {
      this.searchItems = items;
    });
  }

  ngAfterViewInit() {
    this.placeholderText = this.placeholderArray[0];
    const inv = interval(8000);
    inv.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val) => this.changePlaceholdertext());
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  /**
   * @description Change the text inside the placeholder.
   * @memberof SearchComponent
   */
  public changePlaceholdertext() {
    ++this.counter;
    if (this.counter === this.placeholderArray.length) {
      this.counter = 0;
    }
    this.placeholderText = this.placeholderArray[this.counter];
  }

  /**
   * @description basic type-ahead function for search bar.
   * This function get objects from data service,
   * sort objects and filter by criteria,
   * slice to return limited number of objects
   */
  formatter = (x: { name: string }) => x.name;

  /**
   * search for entities with specified search term
   * sort search results by relativeRank, type, position of the term within the search result.
   * select 10 out of all results that should be shown
   * @param text: search term
   */
  public search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      switchMap(async (term) => {
        if (term === '') {
          return [];
        }
        let entities = await this.dataService.findEntitiesByLabelText(term.toLowerCase());
        entities = entities
          .filter((v) => v.label.toLowerCase().indexOf(term.toLowerCase()) > -1)
          .sort(
            (a, b): any => {
              let rankA = a.relativeRank;
              let rankB = b.relativeRank;
              const typeA = a.type;
              const typeB = b.type;
              const aPos = a.label.toLowerCase().indexOf(term.toLowerCase());
              const bPos = b.label.toLowerCase().indexOf(term.toLowerCase());

              if (typeB < typeA) {
                return 1;
              } else if (typeA < typeB) {
                return -1;
              }
              // factor 2 for initial position
              if (aPos === 0) {
                rankA *= 2;
              }
              if (bPos === 0) {
                rankB *= 2;
              }
              // factor 0.5 for non-whitespace in front
              if (
                aPos > 0 &&
                a.label
                  .toLowerCase()
                  .charAt(aPos - 1)
                  .match(/\S/)
              ) {
                rankA *= 0.5;
              }
              if (
                bPos > 0 &&
                b.label
                  .toLowerCase()
                  .charAt(bPos - 1)
                  .match(/\S/)
              ) {
                rankA *= 0.5;
              }
              return rankB > rankA ? 1 : rankB < rankA ? -1 : 0;
            }
          );
        entities = this.selectSearchResults(entities).sort(
          (a, b): any => {
            return (a.type === 'artwork' && b.type !== 'artwork') || a.type > b.type;
          }
        );
        return this.searchInput ? entities : [];
      })
    );

  /** select up to 10 results from entities, distributes over all categories 
   * @param entities results out of which should be selected
  */
  selectSearchResults(entities: Entity[]) {
    const artworks = [];
    const artists = [];
    const materials = [];
    const genre = [];
    const motifs = [];
    const movements = [];
    const locations = [];
    for (const ent of entities) {
      switch (ent.type) {
        case 'artwork': {
          artworks.push(ent);
          break;
        }
        case 'artist': {
          artists.push(ent);
          break;
        }
        case 'material': {
          materials.push(ent);
          break;
        }
        case 'genre': {
          genre.push(ent);
          break;
        }
        case 'object': {
          motifs.push(ent);
          break;
        }
        case 'movement': {
          movements.push(ent);
          break;
        }
        case 'location': {
          locations.push(ent);
          break;
        }
      }
    }

    const newEntities = artworks
      .splice(0, 3)
      .concat(artists.splice(0, 3))
      .concat(materials.splice(0, 2))
      .concat(genre.splice(0, 2))
      .concat(motifs.splice(0, 2))
      .concat(movements.splice(0, 2))
      .concat(locations.splice(0, 2));

    const restItems = artworks
      .concat(artists)
      .concat(materials)
      .concat(genre)
      .concat(motifs)
      .concat(movements)
      .concat(locations);

    return newEntities.concat(restItems).splice(0, 10);
  }

  /**
   * @description function called when selecting an item in type-ahead suggestions
   * based on type of item
   */
  public async itemSelected($event) {
    this.searchInput = '';
    this.isSearching = false;
    if ($event.item.type !== 'artwork') {
      this.dataService.addSearchTag({
        label: $event.item.label,
        type: $event.item.type,
        id: $event.item.id,
      });
      $event.preventDefault();
    }

    if (this.searchItems.length === 1) {
          let url = `/${$event.item.type}/${$event.item.id}`;
        if ($event.item.type === 'object') {
        url = `/motif/${$event.item.id}`;
        this.router.navigate([url]);
      }
    } else if( $event.item.type === 'artwork') {
      this.isSearching = true;
      let url = `/artwork/${$event.item.id}`;
      this.router.navigate([url]);
    } else {
      console.log('label: ' + $event.item.label);
      this.router.navigate(['/search'], { queryParams: this.buildQueryParams() });
    }
  }

  /** build query params for search result url */
  buildQueryParams() {
    const params = {
      term: [],
      artist: [],
      motif: [],
      movement: [],
      genre: [],
      material: [],
      location: [],
    };
    for (const item of this.searchItems) {
      if (!item.type) {
        params.term.push(item.label);
      } else {
        switch (item.type) {
          case 'artist': {
            params.artist.push(item.id);
            break;
          }
          case 'movement': {
            params.movement.push(item.id);
            break;
          }
          case 'genre': {
            params.genre.push(item.id);
            break;
          }
          case 'material': {
            params.material.push(item.id);
            break;
          }
          case 'object': {
            params.motif.push(item.id);
            break;
          }
          case 'location': {
            params.location.push(item.id);
            break;
          }
        }
      }
    }
    return params;
  }

  /**
   * @description search for string when no item is selected
   */
  public navigateToSearchText(term) {
    if (!this.isSearching){
      console.log("Navigation fired");
      if (term !== '' && !(term instanceof Object)) {
        this.dataService.addSearchTag({
          label: term,
          type: null,
          id: null,
        });
      }
      this.searchInput = '';
      this.router.navigate(['/search'], { queryParams: this.buildQueryParams() });
    }
  }

  /**
   * @description search items when there are chips and no input
   */
  public searchText() {
    const sItem = this.dataService.searchItems[0];
    if (this.searchInput === '' && this.searchItems.length === 1 && sItem.type) {
      let url = `/${sItem.type}/${sItem.id}`;
      if (sItem.type === 'object') {
        url = `/motif/${sItem.id}`;
      }
      this.router.navigate([url]);
    } else {
      this.navigateToSearchText(this.searchInput);
    }
  }

  /**
   * @description remove chip from search bar
   */
  public removeTag(item: TagItem) {
    this.dataService.removeSearchTag(item);
  }

  /**
   * @description get chips ready to be removed.
   * used to prevent backspace to accidentally delete all chips
   */
  public readyToRemove() {
    if (this.searchInput === '' && this.searchItems.length > 0) {
      this.rmTag = true;
    }
  }
  /**
   * @description remove newest chip
   */
  public removeNewestTag() {
    if (this.searchInput === '' && this.rmTag === true) {
      this.searchItems.splice(this.searchItems.length - 1, 1);
    }
    this.rmTag = false;
  }

  /**
   * @description remove all chips
   */
  public clearAllTags() {
    this.dataService.searchItems = [];
    this.searchItems = [];
  }
}
