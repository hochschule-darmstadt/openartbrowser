// TODO remove unused imports
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Artist, Artwork, TagItem } from 'src/app/shared/models/models';
import { DataService } from 'src/app/core/services/data.service';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';

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
  //  searchTerm: string;
  searchItems: TagItem[] = [];
  objectArray: string[] = [];
  artistArray: string[] = [];
  movementArray: string[] = [];
  locationArray: string[] = [];
  genreArray: string[] = [];
  materialArray: string[] = [];
  searchTerms: string[] = [];

  constructor(private dataService: DataService, private route: ActivatedRoute) { }


  /** hook that is executed at component initialization */
  async ngOnInit() {
    this.searchItems = this.dataService.getTagItems();
    console.log("Search item is: ")
    console.log(this.searchItems);
    for (let i = 0; i < this.searchItems.length; i++) {
      switch (this.searchItems[i].type) {
        case null:
          this.searchTerms.push(this.searchItems[i].label);
          break;
        case 'artist':
          this.artistArray.push(this.searchItems[i].id);
          break;
        case 'object':
          this.objectArray.push(this.searchItems[i].id);
          break;
        case 'movement':
          this.movementArray.push(this.searchItems[i].id);
          break;
        case 'location':
          this.locationArray.push(this.searchItems[i].id);
          break;
        case 'genre':
          this.genreArray.push(this.searchItems[i].id);
          break;
        case 'material':
          this.materialArray.push(this.searchItems[i].id);
          break;
      }
    }
    console.log("Artist is : " + this.artistArray);
    console.log("Genre is : " + this.genreArray);
    console.log("String is : " + this.searchTerms);
    this.sliderItems = await this.dataService.findArtworksByCategories({ creators: this.artistArray, 
                                                                          depicts: this.objectArray, 
                                                                          movements: this.movementArray, 
                                                                          locations: this.locationArray,
                                                                          genres: this.genreArray,
                                                                          materials: this.materialArray }, this.searchTerms);
    console.log(this.sliderItems);
  }

  //  public async getSearchResult(){
  //   this.subscription = this.dataService.getTagItems().subscribe(data => {this.searchItems = data})
  // console.log("Search item is: ")
  // console.log(this.searchItems);
  //  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
