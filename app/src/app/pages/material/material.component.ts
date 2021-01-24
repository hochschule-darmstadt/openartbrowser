import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import {Material, EntityType, Entity} from 'src/app/shared/models/models';
import { Subject } from 'rxjs';
import { DataService } from 'src/app/core/services/elasticsearch/data.service';
import {FetchOptions} from "../../shared/components/fetching-list/fetching-list.component";

@Component({
  selector: 'app-material',
  templateUrl: './material.component.html',
  styleUrls: ['./material.component.scss']
})
export class MaterialComponent implements OnInit, OnDestroy {
  /** use this to end subscription to url parameter in ngOnDestroy */
  private ngUnsubscribe = new Subject();

  /** The entity this page is about */
  material: Material = null;

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
      const materialId = params.get('materialId');
      this.fetchOptions.queryCount = this.dataService.countArtworksByType(EntityType.MATERIAL, [materialId]);

      /** load fetching list items */
      this.query = async (offset) => {
        return await this.dataService.findArtworksByType(
          EntityType.MATERIAL, [materialId], this.fetchOptions.fetchSize, offset)
      }

      /** Use data service to fetch entity from database */
      this.material = await this.dataService.findById<Material>(materialId, EntityType.MATERIAL);
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
