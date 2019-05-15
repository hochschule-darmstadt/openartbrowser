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
        entities = entities.sort(function(a, b): any {
          const rankA = a.relativeRank;
          const rankB = b.relativeRank;
          const typeA = a.type;
          const typeB = b.type;
          return typeB < typeA ? 1 : typeB > typeA ? -1 : rankB > rankA ? 1 : rankB < rankA ? -1 : 0;
        });
        return entities.filter((v) => v.label.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10);
      })
    );
}
