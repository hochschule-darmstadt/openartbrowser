import { Component, OnInit, OnDestroy } from '@angular/core';
import { Artist, Artwork } from 'src/app/shared/models/models';
import { DataService } from 'src/app/core/services/data.service';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.scss']
})
export class SearchResultComponent implements OnInit {
 /** use this to end subscription to url parameter in ngOnDestroy */
 private ngUnsubscribe = new Subject();

 /** Related artworks */
 sliderItems: Artwork[] = [];

 constructor(private dataService: DataService, private route: ActivatedRoute) { }


 /** hook that is executed at component initialization */
 ngOnInit() {
   /** Extract the id of entity from URL params. */
   this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe(async (params) => {
     const searchTerm = params.get('term');
     console.log(searchTerm);
     this.sliderItems = await this.dataService.findArtworkByLabelText(searchTerm) as Artwork[];
   });
 }

 ngOnDestroy() {
   this.ngUnsubscribe.next();
   this.ngUnsubscribe.complete();
 }
}
