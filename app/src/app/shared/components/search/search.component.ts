import { Component, OnInit } from '@angular/core';
import { Observable, from } from 'rxjs';
import { debounceTime, map, switchMap } from 'rxjs/operators';
import { DataService } from 'src/app/core/services/data.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
  hideElement: boolean = true;
  addtags: string[] = [];
  public model: any;

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      switchMap(async (term) => {
        return await this.dataService.findEntitiesByLabelText(term);
      })
    );

  formatter = (x: { name: string }) => x.name;

  constructor(private dataService: DataService) {}

  ngOnInit() {}
}
