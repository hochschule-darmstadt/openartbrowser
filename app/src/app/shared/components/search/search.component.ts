import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { DataService } from 'src/app/core/services/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, switchMap } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
  hideElement = true;
  addtags: string[] = [];
  searchInput: string;
  rmTag: boolean = false;

  constructor(private dataService: DataService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {}

  formatter = (x: { name: string }) => x.name;

  private search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      switchMap(async (term) => {
        if (term === '') {
          return [];
        }
        let entities = await this.dataService.findEntitiesByLabelText(term.toLowerCase());
        console.log(entities);
        entities = entities.filter((v) => v.label.toLowerCase().indexOf(term.toLowerCase()) > -1)
          .sort((a, b): any => {
          let rankA = a.relativeRank;
          let rankB = b.relativeRank;
          const typeA = a.type;
          const typeB = b.type;
          const aPos = a.label.toLowerCase().indexOf(term.toLowerCase());
          const bPos = b.label.toLowerCase().indexOf(term.toLowerCase());

          if (typeB < typeA) { return 1; } else if (typeA < typeB) { return -1; }
          // factor 2 for initial position
          if (aPos === 0) {

              rankA *= 2;
            }
          if (bPos === 0) {

              rankB *= 2;
            }
          // factor 0.5 for non-whitespace in front
          if (aPos > 0 && a.label.toLowerCase().charAt(aPos - 1).match(/\S/)) {
              rankA *= 0.5;
            }
          if (bPos > 0 && b.label.toLowerCase().charAt(bPos - 1).match(/\S/)) {
              rankA *= 0.5;
            }
          return rankB > rankA ? 1 : rankB < rankA ? -1 : 0;
          })
          .filter((w, i, arr) =>  ((w.type === 'artist')                                  // if type is artwork or artist, take 3
                                  && w.type !== (arr[i - 3] ? arr[i - 3].type : ''))      
                              || ((w.type !== 'artwork' && w.type !== 'artist')           // if type is other type, take 2
                                  && w.type !== (arr[i - 2] ? arr[i - 2].type : ''))
                              || (w.type === 'artwork') && w.type !== (arr[i - 3] ? arr[i - 3].type : ''))   // To Do: get more suggestion if list does not have enough elements
          .slice(0, 10)
          .sort((a,b): any => {
            let typeA = a.type;
            let typeB = b.type;
            if ((typeA == 'artist' || typeA == 'artwork') && (typeB == 'artwork' || typeB == 'artist')) { 
              if (typeB < typeA) { return -1; } else if (typeA < typeB) { return 1; }
            }
          });
        return this.searchInput ? entities : [];
      })
    )

    private async itemSelected($event){
      if ($event.item.type == 'object') {
        const url = `/motif/${$event.item.id}`;
        this.addtags.push($event.item.label);
        this.router.navigate([url]);
      } else if ($event.item.type == 'artwork'){
        const url = `/${$event.item.type}/${$event.item.id}`;
        // this.addtags.push($event.item.label);
        this.router.navigate([url]);
      } else {
        const url = `/${$event.item.type}/${$event.item.id}`;
        this.addtags.push($event.item.label);
        this.router.navigate([url]);
      }
    }

    private navigateToSearchText(term: string) {
      this.searchInput = '';
      if (term !== '') {
        this.addtags.push(`"${term}"`);
        let url = '/search/';
        if (this.addtags.length > 1) {
          url += `${this.addtags.join('&').replace(/"/g, '')}`;
        } else {
          url += `${term}`;
          console.log(this.addtags);
        }
        this.router.navigate([url]);
      }
    }

    private removeTag(i: string) {
      const index = this.addtags.indexOf(i);
      if (index > -1) {
        this.addtags.splice(index, 1);
      }
    }

    private readyToRemove() {
      if (this.searchInput === '' && this.addtags.length > 0) {
        this.rmTag = true;
      }
    }

    private removeNewestTag() {
      if (this.rmTag === true && this.searchInput === '') {
        this.addtags.splice(this.addtags.length - 1, 1);
      }
      this.rmTag = false;
    }

    private clearAllTags(){
      this.addtags = [];
    }

}
