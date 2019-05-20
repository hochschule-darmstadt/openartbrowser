import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { DataService } from 'src/app/core/services/data.service';
import { ActivatedRoute } from '@angular/router';
import { debounceTime, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
  hideElement = true;
  addtags: string[] = [];

  constructor(private dataService: DataService, private route: ActivatedRoute) {}

  ngOnInit() {}

  formatter = (x: { name: string }) => x.name;

  search = (text$: Observable<string>) =>
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
          // console.log(a.label + ' at ' + aPos + ' AND ' + b.label + ' at ' + bPos);
          // return typeB < typeA ? 1 : typeB > typeA ? -1 : rankB > rankA ? 1 : rankB < rankA ? -1 : 0;
          if (typeB < typeA) { return 1; } else if (typeA < typeB) { return -1; }
          // factor 2 for initial position
          if (aPos === 0) {
              // console.log('initial position in: ' + a.label);
              rankA *= 2;
            }
          if (bPos === 0) {
              // console.log('initial position in: ' + b.label);
              rankB *= 2;
            }
          // factor 0.5 for non-whitespace in front
          if (aPos > 0 && a.label.toLowerCase().charAt(aPos - 1).match(/\S/)) {
              // console.log('no whitespace in: ' + a.label + ' at ' + (aPos - 1));
              rankA *= 0.5;
            }
          if (bPos > 0 && b.label.toLowerCase().charAt(bPos - 1).match(/\S/)) {
              // console.log('no whitespace in: ' + b.label + ' at ' + (bPos - 1));
              rankA *= 0.5;
            }
          return rankB > rankA ? 1 : rankB < rankA ? -1 : 0;
          })
          .filter((w, i, arr) => w.type !== (arr[i - 2] ? arr[i - 2].type : '')
          .slice(0, 10));
        // console.log('search: ' + term);
        return entities;
      })
    )
}
