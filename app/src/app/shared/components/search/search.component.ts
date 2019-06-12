import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { DataService } from 'src/app/core/services/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, switchMap } from 'rxjs/operators';
import { TagItem } from '../../models/models';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})

export class SearchComponent implements OnInit {

  /**
   * @description input for search component.
   * @type string
   * @memberof SearchComponent
   */
  searchInput: string;

  /**
   * @description simple check to prep tag for removal
   * @type boolean
   * @memberof SearchComponent
   */
  rmTag: boolean = false;

  /**
   * @description Array of all chips.
   * @type TagItemp[]
   * @memberof SearchComponent
   */
  searchItems: TagItem[] = [];

  constructor(private dataService: DataService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() { }

  /**
   * @description basic type-ahead function for search bar.
   * This function get objects from data service,
   * sort objects and filter by criteria,
   * slice to return limited number of objects
   * @memberof SearchComponent
   */
  formatter = (x: { name: string }) => x.name;

  public search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      switchMap(async (term) => {
        if (term === '') {
          return [];
        }
        let entities = await this.dataService.findEntitiesByLabelText(term.toLowerCase());
        //TODO: remove console logs and commented out code
        console.log(entities);
        entities = entities.filter((v) => v.label.toLowerCase().indexOf(term.toLowerCase()) > -1)
          .sort((a, b): any => {
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
          )
          .filter(
            (w, i, arr) => (w.type === 'artist' && // if type is artwork or artist, take 3
              w.type !== (arr[i - 3] ? arr[i - 3].type : '')) ||
              (w.type !== 'artwork' &&
                w.type !== 'artist' && // if type is other type, take 2
                w.type !== (arr[i - 2] ? arr[i - 2].type : '')) ||
              (w.type === 'artwork' && w.type !== (arr[i - 3] ? arr[i - 3].type : ''))
          ) // To Do: get more suggestion if list does not have enough elements
          .slice(0, 10)
          .sort(
            (a, b): any => {
              let typeA = a.type;
              let typeB = b.type;
              if ((typeA === 'artist' || typeA === 'artwork') && (typeB === 'artwork' || typeB === 'artist')) {
                // switch place of artist and artwork
                if (typeB < typeA) {
                  return -1;
                } else if (typeA < typeB) {
                  return 1;
                }
              }
            }
          );
        return this.searchInput ? entities : [];
      })
    );

  /**
   * @description function called when selecting an item in type-ahead suggestions
   * based on type of item
   * @memberof SearchComponent
   */
  public async itemSelected($event) {
    if ($event.item.type === 'object') {
      let eventItem: TagItem = {
        label: $event.item.label,
        type: $event.item.type,
        id: $event.item.id,
      };
      this.searchItems.push(eventItem);
      const url = `/motif/${$event.item.id}`;
      this.searchInput = '';
      $event.preventDefault();
      this.router.navigate([url]);
    } else if ($event.item.type === 'artwork') {
      const url = `/${$event.item.type}/${$event.item.id}`;
      this.searchInput = '';
      this.router.navigate([url]);
    } else {
      let eventItem: TagItem = {
        label: $event.item.label,
        type: $event.item.type,
        id: $event.item.id,
      };
      this.searchItems.push(eventItem);
      const url = `/${$event.item.type}/${$event.item.id}`;
      this.searchInput = '';
      $event.preventDefault();
      this.router.navigate([url]);
    }
  }

  /**
   * @description search for string when no item is selected
   * @memberof SearchComponent
   */
  public navigateToSearchText(term) {
    // this.searchInput = '';
    if (term !== '' && !(term instanceof Object)) {
      let searchItem: TagItem = {
        label: term,
        type: null,
        id: null,
      };
      this.searchItems.push(searchItem);
      let url = '/search/';
      if (this.searchItems.length > 1) {
        let searchString = this.searchItems
          .map((item) => item.label)
          .join('&')
          .replace(/"/g, '');
        url += `${searchString}`;
      } else {
        url += `${term}`;
      }
      //TODO: instead of setting and getting searchItems in data service, query params should be specified in router.navigate
      this.dataService.sendTagItems(this.searchItems);
      this.searchInput = '';
      this.router.navigate([url]);
    } else if (term === '' && this.searchInput === '' && !(term instanceof Object)) {
      console.log('search input is: ' + this.searchInput);
      let url = '/search/';
      if (this.searchItems.length > 1) {
        let searchString = this.searchItems
          .map((item) => item.label)
          .join('&')
          .replace(/"/g, '');
        url += `${searchString}`;
        this.dataService.sendTagItems(this.searchItems);
        this.searchInput = '';
        this.router.navigate([url]);
      }
    }
  }

  /**
   * @description search items when there are chips and no input
   * @memberof SearchComponent
   */
  public searfchText() {
    let term = this.searchInput;
    this.navigateToSearchText(term);
  }

  /**
   * @description remove chip from search bar
   * @memberof SearchComponent
   */
  private removeTag(item: TagItem) {
    this.searchItems = this.searchItems.filter((i) => i !== item);
  }

  /**
   * @description get chips ready to be removed.
   * used to prevent backspace to accidentally delete all chips
   * @memberof SearchComponent
   */
  public readyToRemove() {
    if (this.searchInput === '' && this.searchItems.length > 0) {
      this.rmTag = true;
    }
  }
  /**
   * @description remove newest chip
   * @memberof SearchComponent
   */
  public removeNewestTag() {
    if (this.searchInput === '' && this.rmTag === true) {
      this.searchItems.splice(this.searchItems.length - 1, 1);
    }
    this.rmTag = false;
  }

  /**
   * @description remove all chips
   * @memberof SearchComponent
   */
  public clearAllTags() {
    this.searchItems = [];
  }

  /**
   * @description truncate input text
   * @memberof SearchComponent
   */
  private truncate(input: string) {
    if (input.length > 8) {
      return input.substring(0, 7) + '...';
    } else {
      return input;
    }
  }

  /**
   * @description add chip for string
   * @memberof SearchComponent
   */
  public formatNoTypeChip(label: string) {
    return `"${label}"`;
  }
}
