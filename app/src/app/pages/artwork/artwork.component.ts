import { Component, OnInit } from '@angular/core';
import { Artwork } from 'src/app/shared/models/models';
import { take } from 'rxjs/operators';
import { DataService } from 'src/app/core/services/data.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-artwork',
  templateUrl: './artwork.component.html',
  styleUrls: ['./artwork.component.scss'],
})
export class ArtworkComponent implements OnInit {
  constructor(private dataService: DataService, private route: ActivatedRoute) {}

  /** hook that is executed at component initialization */
  ngOnInit() {
    /** Extract the id of entity from URL params. */
    this.route.paramMap.pipe(take(1)).subscribe((params) => {
      const artworkId = params.get('artworkId');
      /** Use data service to fetch entity from database */
      this.dataService
        .findById(artworkId)
        .then((entity) => {
          this.artwork = entity as Artwork;
        })
        .catch((err) => {
          console.log(err);
        });
    });
  }

  /** The entity this page is about */
  artwork: Artwork = null;
}
