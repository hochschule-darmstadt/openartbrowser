import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/core/services/data.service';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { Motif } from 'src/app/shared/models/models';

@Component({
  selector: 'app-motif',
  templateUrl: './motif.component.html',
  styleUrls: ['./motif.component.scss'],
})
export class MotifComponent implements OnInit {
  constructor(private dataService: DataService, private route: ActivatedRoute) {}

  /** hook that is executed at component initialization */
  ngOnInit() {
    /** Extract the id of entity from URL params. */
    this.route.paramMap.pipe(take(1)).subscribe((params) => {
      const motifId = params.get('motifId');
      /** Use data service to fetch entity from database */
      this.dataService
        .findById(motifId)
        .then((entity) => {
          this.motif = entity as Motif;
        })
        .catch((err) => {
          console.log(err);
        });
    });
  }

  /** The entity this page is about */
  motif: Motif = null;
}
