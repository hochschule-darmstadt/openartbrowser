import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Class, EntityType, Entity } from 'src/app/shared/models/models';
import { Subject } from 'rxjs';
import { DataService } from 'src/app/core/services/elasticsearch/data.service';
import { FetchOptions } from "../../shared/components/fetching-list/fetching-list.component";

@Component({
  selector: 'app-class',
  templateUrl: './class.component.html',
  styleUrls: ['./class.component.scss']
})
export class ClassComponent implements OnInit, OnDestroy {
  /** use this to end subscription to url parameter in ngOnDestroy */
  private ngUnsubscribe = new Subject();

  /** The entity this page is about */
  class: Class = null;

  /** The parent class of this entity */
  parentClasses: Class[] = null;

  idDoesNotExist = false;
  classId: string;

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
      this.classId = params.get('classId');

      this.fetchOptions.queryCount = this.dataService.countArtworksByType(EntityType.CLASS, [this.classId]);

      /** load fetching list items */
      this.query = async (offset) => {
        return await this.dataService.findArtworksByType(
          EntityType.CLASS, [this.classId], this.fetchOptions.fetchSize, offset)
      };

      /** Use data service to fetch entity from database */
      this.class = await this.dataService.findById<Class>(this.classId, EntityType.CLASS);

      /** Use data service to fetch parent class entity from database */
      if(this.class?.subclass_of) this.parentClasses = await this.dataService.findMultipleById<Class>(this.class?.subclass_of, EntityType.CLASS);
      if (!this.class) { this.idDoesNotExist = true }
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
