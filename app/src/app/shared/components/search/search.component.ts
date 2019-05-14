import { Component, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { debounceTime, map, takeUntil } from 'rxjs/operators';
import { Artwork } from '../../models/models';
import { DataService } from 'src/app/core/services/data.service';
import { ActivatedRoute } from '@angular/router';
import { async } from 'q';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  private ngUnsubscribe = new Subject();

  artworks: Artwork[] = [];

  constructor(private dataService: DataService, private route: ActivatedRoute) { }

  ngOnInit() {
  }

  hideElement: boolean = true;
  addtags: string[] = [];
  public model: any;

  search = (text$: Observable<string>) => {
    this.route.paramMap.subscribe(async(params) => {
      const label = params.get('label');
      this.artworks = (await this.dataService.findEntitiesByLabelText(label)) as Artwork[];
      console.log(this.artworks);
    });
    return text$.pipe(
      debounceTime(200),
      map(term => term === '' ? []
        : this.artworks.filter(v => v.label.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    )}

  formatter = (x: {name: string}) => x.name;


}
