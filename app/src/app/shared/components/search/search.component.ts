import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { DataService } from 'src/app/core/services/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
  hideElement = true;
  addtags: string[] = [];

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
        let entities = await this.dataService.findEntitiesByLabelText(term);
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
          .filter((w, i, arr) =>  ((w.type == 'artwork' || w.type == 'artist') && w.type !== (arr[i - 3] ? arr[i - 3].type : ''))  // if type is artwork or artist, take 3
          || ((w.type !== 'artwork' && w.type !== 'artist') && w.type !== (arr[i - 2] ? arr[i - 2].type : '')))                     // if type is other type, take 2
          .slice(0, 10);
        return entities;
      })
    )

    private async itemSelected($event){
      let id = ($event.item.id);
      console.log(id);
      let entity = await this.dataService.findById(id);
      console.log(entity);
      let entityId = entity['id'];
      let entityType = entity['type'];
      let url = `/${entityType}/${entityId}`;
      this.router.navigate([url]);
    } 

    private navigateToSearchText(term: string){
      let url = `/search/${term}`;
      console.log(url);
      this.router.navigate([url]);
    }
}
