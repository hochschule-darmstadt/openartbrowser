import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Motif, Artwork, EntityType } from 'src/app/shared/models/models';
import { Subject } from 'rxjs';
import { DataService } from 'src/app/core/services/elasticsearch/data.service';
import { shuffle } from 'src/app/core/services/utils.service';

@Component({
  selector: 'app-motif',
  templateUrl: './motif.component.html',
  styleUrls: ['./motif.component.scss']
})
export class MotifComponent implements OnInit, OnDestroy {
  /** use this to end subscription to url parameter in ngOnDestroy */
  private ngUnsubscribe = new Subject();

  /** The entity this page is about */
  motif: Motif = null;

  /** Related artworks */
  sliderItems: Artwork[] = [];

  /** Change collapse icon; true if more infos are folded in */
  collapse = true;


  constructor(private dataService: DataService, private route: ActivatedRoute) {}

  /** hook that is executed at component initialization */
  ngOnInit() {
    /** Extract the id of entity from URL params. */
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe(async params => {
      const motifId = params.get('motifId');
      /** Use data service to fetch entity from database */
      this.motif = await this.dataService.findById<Motif>(motifId, EntityType.MOTIF);

      /** load slider items */
      await this.dataService.findArtworksByType(EntityType.MOTIF, [this.motif.id]).then(artworks => (this.sliderItems = shuffle(artworks)));
      this.calculateCollapseState();
    });
  }

  /** Decides whether to show the 'more' section or not based on the amount of available data:
   * calculates the size of meta data item section
   * every attribute: +3
   * if attribute is array and size > 3 -> + arraylength
   */
  private calculateCollapseState() {
    let metaNumber = 0;
    if (this.motif.abstract.length > 400) {
      metaNumber += 10;
    } else if (this.motif.abstract.length) {
      metaNumber += 3;
    }
    this.collapse = metaNumber >= 10;
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
