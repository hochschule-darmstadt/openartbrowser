import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataService } from 'src/app/core/services/data.service';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Genre, Artwork, EntityType } from 'src/app/shared/models/models';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-genre',
  templateUrl: './genre.component.html',
  styleUrls: ['./genre.component.scss'],
})
export class GenreComponent implements OnInit, OnDestroy {
  /** use this to end subscription to url parameter in ngOnDestroy */
  private ngUnsubscribe = new Subject();

  /** The entity this page is about */
  genre: Genre = null;

  /** Related artworks */
  sliderItems: Artwork[] = [];

  constructor(private dataService: DataService, private route: ActivatedRoute) {}

  /** hook that is executed at component initialization */
  ngOnInit() {
    /** Extract the id of entity from URL params. */
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe(async (params) => {
      const genreId = params.get('genreId');

      /** Use data service to fetch entity from database */
      this.genre = await this.dataService.findById<Genre>(genreId, EntityType.GENRE);

      /** load slider items */
      this.dataService.findArtworksByGenres([this.genre.id]).then((artworks) => {
        this.sliderItems = this.shuffle(artworks);
      });
    });
  }

  /**
   * @description shuffle the items' categories.
   * @memberof ArtworkComponent
   */
  shuffle = (a: Artwork[]): Artwork[] => {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
