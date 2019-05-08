import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataService } from 'src/app/core/services/data.service';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Genre, Entity } from 'src/app/shared/models/models';
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

  constructor(private dataService: DataService, private route: ActivatedRoute) {}

  /** hook that is executed at component initialization */
  ngOnInit() {
    /** Extract the id of entity from URL params. */
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params) => {
      const genreId = params.get('genreId');
      /** Use data service to fetch entity from database */
      this.dataService
        .findById(genreId)
        .then((entity) => {
          this.genre = entity as Genre;
        })
        .catch((err) => {
          console.log(err);
        });
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  sliderItems: Entity[] = [
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Feminine_figure-Ma_4998-IMG_4949-gradient.jpg',
      label: 'Feminine figure-Ma 4998',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Feminine_figure-Ma_5010-IMG_4959-gradient.jpg',
      label: 'Feminine figure-Ma 5010',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Seated_woman-Ma_4992-IMG_4946-gradient.jpg',
      label: 'Seated woman-Ma 4992',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/3/39/Feminine_figure-Ma_4999-IMG_4950-gradient.jpg',
      label: 'Feminine figure-Ma 4999',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/b/b4/Feminine_figure-Ma_4997-IMG_4954-gradient.jpg',
      label: 'Feminine figure-Ma 4997',
    },
  ];
}
