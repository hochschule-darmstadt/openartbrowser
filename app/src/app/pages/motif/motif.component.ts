import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import {Motif, EntityType, Entity} from 'src/app/shared/models/models';
import { Subject } from 'rxjs';
import { DataService } from 'src/app/core/services/elasticsearch/data.service';
import {FetchOptions} from "../../shared/components/fetching-list/fetching-list.component";

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
  fetchOptions = {
    initOffset: 0,
    fetchSize: 30,
    queryCount: undefined,
    entityType: EntityType.ARTWORK
  } as FetchOptions;
  query: (offset: number) => Promise<Entity[]>;

  constructor(private dataService: DataService, private route: ActivatedRoute) {}

  /** hook that is executed at component initialization */
  ngOnInit() {
    /** Extract the id of entity from URL params. */
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe(async params => {
      const motifId = params.get('motifId');

      this.fetchOptions.queryCount = this.dataService.countArtworksByType(EntityType.MOTIF, [motifId]);

      /** load fetching list items */
      this.query = async (offset) => {
        return await this.dataService.findArtworksByType(
          EntityType.MOTIF, [motifId], this.fetchOptions.fetchSize, offset)
      };

      /** Use data service to fetch entity from database */
      this.motif = await this.dataService.findById<Motif>(motifId, EntityType.MOTIF);
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
