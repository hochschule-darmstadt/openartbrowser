import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/core/services/data.service';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { Location, Entity } from 'src/app/shared/models/models';

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss'],
})
export class LocationComponent implements OnInit {
  constructor(private dataService: DataService, private route: ActivatedRoute) {}

  /** hook that is executed at component initialization */
  ngOnInit() {
    /** Extract the id of entity from URL params. */
    this.route.paramMap.pipe(take(1)).subscribe((params) => {
      const locationId = params.get('locationId');
      /** Use data service to fetch entity from database */
      this.dataService
        .findById(locationId)
        .then((entity) => {
          this.location = entity as Location;
        })
        .catch((err) => {
          console.log(err);
        });
    });
  }

  /** The entity this page is about */
  location: Location = null;

  /** Change collapse icon */
  collapseDown: boolean = true;

  toggleDetails() {
    this.collapseDown = !this.collapseDown;
  }

  /** Dummy artworks */
  sliderItems: Entity[] = [
    {
      id: '',
      description: '',
      type: '',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/9/91/Akseli_Gallen-Kallela_Carl_Gustaf_Emil_Mannerheimin_muotokuva.jpg',
      label: 'Portrait of Carl Gustaf Emil Mannerheim',
    },
    {
      id: '',
      description: '',
      type: '',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/b/b9/Akseli_Gallen-Kallela_Cheetah.jpg',
      label: 'Cheetah',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Akseli_Gallen-Kallela_Februari_fantasi.jpg',
      label: 'February fantasy',
    }
  ];

  
}
