import { Component, OnInit } from '@angular/core';
import { Artist, Entity } from 'src/app/shared/models/models';
import { DataService } from 'src/app/core/services/data.service';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-artist',
  templateUrl: './artist.component.html',
  styleUrls: ['./artist.component.scss'],
})
export class ArtistComponent implements OnInit {
  constructor(private dataService: DataService, private route: ActivatedRoute) {}

  /** hook that is executed at component initialization */
  ngOnInit() {
    /** Extract the id of entity from URL params. */
    this.route.paramMap.pipe(take(1)).subscribe((params) => {
      const artistId = params.get('artistId');
      /** Use data service to fetch entity from database */
      this.dataService
        .findById(artistId)
        .then((entity) => {
          this.artist = entity as Artist;
        })
        .catch((err) => {
          console.log(err);
        });
    });
  }

  /** The entity this page is about */
  artist: Artist = null;

  sliderItems: Entity[] = [];
}
