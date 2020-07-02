import { Component, OnInit } from '@angular/core';
import { DataService } from '../../core/services/elasticsearch/data.service';
import { ActivatedRoute } from '@angular/router';
import {
  Entity,
  Movement,
  Artwork,
  Artist,
  Genre,
  Motif,
  Location,
  Material,
  EntityType
} from 'src/app/shared/models/models';
import { FetchOptions } from '../../shared/components/fetching-list/fetching-list.component';

@Component({
  selector: 'app-entities',
  templateUrl: './entities.component.html',
  styleUrls: ['./entities.component.scss']
})
export class EntitiesComponent implements OnInit {
  fetchOptions = {
    initOffset: 0,
    fetchSize: 20,
    queryCount: undefined,
    entityType: undefined
  } as FetchOptions;
  query: (offset: number) => Promise<Entity[]>;

  constructor(private dataService: DataService, private route: ActivatedRoute) {
  }

  ngOnInit() {
    if (this.route.pathFromRoot[1]) {
      /** get type which shall be handled from url */
      this.route.pathFromRoot[1].url.subscribe(val => {
        const lastPathSegment = val[0].path.substr(0, val[0].path.length - 1);
        this.fetchOptions.entityType = EntityType[lastPathSegment.toUpperCase() as keyof typeof EntityType];
        /** get max number of elements */
        this.dataService.countEntityItems(this.fetchOptions.entityType).then(value => {
          this.fetchOptions.queryCount = value;
        });
      });
    }

    this.query = async (offset) => {
      switch (this.fetchOptions.entityType) {
        case EntityType.MOVEMENT:
          return await this.dataService.getEntityItems<Movement>(
            this.fetchOptions.entityType, this.fetchOptions.fetchSize, offset);
        case EntityType.ARTIST:
          return await this.dataService.getEntityItems<Artist>(
            this.fetchOptions.entityType, this.fetchOptions.fetchSize, offset);
        case EntityType.ARTWORK:
          return await this.dataService.getEntityItems<Artwork>(
            this.fetchOptions.entityType, this.fetchOptions.fetchSize, offset);
        case EntityType.GENRE:
          return await this.dataService.getEntityItems<Genre>(
            this.fetchOptions.entityType, this.fetchOptions.fetchSize, offset);
        case EntityType.LOCATION:
          return await this.dataService.getEntityItems<Location>(
            this.fetchOptions.entityType, this.fetchOptions.fetchSize, offset);
        case EntityType.MOTIF:
          return await this.dataService.getEntityItems<Motif>(
            this.fetchOptions.entityType, this.fetchOptions.fetchSize, offset);
        case EntityType.MATERIAL:
          return await this.dataService.getEntityItems<Material>(
            this.fetchOptions.entityType, this.fetchOptions.fetchSize, offset);
      }
    };
  }
}
