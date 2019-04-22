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

  ngOnInit() {
    /** Take 1 -> unsubscribe immediately after getting params */
    this.route.paramMap.pipe(take(1)).subscribe((params) => {
      const artistId = params.get('artistId');
      this.dataService
        .findArtistById(artistId)
        .then((artist) => {
          this.artist = artist;
        })
        .catch((err) => {
          console.log(err);
        });
    });
  }

  artist: Artist = null;

  sliderItems: Entity[] = [];
}
