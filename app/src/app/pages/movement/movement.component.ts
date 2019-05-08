import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/core/services/data.service';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Movement, Entity } from 'src/app/shared/models/models';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-movement',
  templateUrl: './movement.component.html',
  styleUrls: ['./movement.component.scss'],
})
export class MovementComponent implements OnInit {
  /** use this to end subscription to url parameter in ngOnDestroy */
  private ngUnsubscribe = new Subject();

  /** The entity this page is about */
  movement: Movement = null;

  constructor(private dataService: DataService, private route: ActivatedRoute) {}

  /** hook that is executed at component initialization */
  ngOnInit() {
    /** Extract the id of entity from URL params. */
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params) => {
      const movementId = params.get('movementId');
      /** Use data service to fetch entity from database */
      this.dataService
        .findById(movementId)
        .then((entity) => {
          this.movement = entity as Movement;
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
      image: 'https://upload.wikimedia.org/wikipedia/commons/b/b9/Akseli_Gallen-Kallela_Cheetah.jpg',
      label: 'Cheetah',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Akseli_Gallen-Kallela_Februari_fantasi.jpg',
      label: 'February fantasy',
    },
  ];
}
