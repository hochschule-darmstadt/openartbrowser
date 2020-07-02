import { Component, ContentChild, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { Entity, EntityType } from '../../models/entity.interface';
import { Artwork } from '../../models/artwork.interface';
import { DataService } from '../../../core/services/elasticsearch/data.service';
import { ActivatedRoute } from '@angular/router';

export interface FetchOptions {
  /** initial offset of the query, this is where it will continue to load */
  initOffset: number;
  /** the grater this is, the bigger the fetch */
  fetchSize: number;
  /** the max number of elements */
  queryCount: number;

  /** type which is handled in the component */
  entityType: EntityType;
}


@Component({
  selector: 'app-fetching-list',
  templateUrl: './fetching-list.component.html',
  styleUrls: ['./fetching-list.component.scss']
})
export class FetchingListComponent implements OnInit {

  /** all items to display */
  @Input() listEntities: any[] = [];
  @Output() fetchData = new EventEmitter();

  /** the query which shall be fetched */
  @Input() query: (offset: number) => Promise<Entity[]>;

  @Input() options: FetchOptions;

  @ContentChild(TemplateRef, { static: false }) templateRef;
  offset: number;

  constructor(private dataService: DataService, private route: ActivatedRoute) {
  }

  ngOnInit() {
    if (this.options.initOffset < 0 && this.options.fetchSize <= 0 && !this.options.entityType) {
      throw Error('Invalid fetching list options!');
    }
    this.offset = this.options.initOffset;
  }

  /** This gets called by the app-infinite-scroll component and fetches new data */
  onScroll() {
    /** if there is no more to get, don't fetch again */
    if (this.options.initOffset > this.options.queryCount) {
      return;
    }
    this.listEntities.push(...Array(this.options.fetchSize).fill({}));
    const currentOffset = this.offset;
    const capitalize = (str, lower = false) =>
      (lower ? str.toLowerCase() : str).replace(/(?:^|\s|["'([{])+\S/g, match => match.toUpperCase());
    this.query(currentOffset).then(entities => {
      entities.forEach(entity => {
        entity.label = capitalize(entity.label);
        /** If image link is missing, query for random image */
        if (!entity.image) {
          this.setRandomArtwork(entity);
        }
        // insert further entity processing here
      });
      /** replace empty objects with fetched objects.
       *  This has the advantage of no further sorting of this.entities (which may be very large)
       */
      this.listEntities.splice(currentOffset, this.options.fetchSize, ...entities);
    });
    this.offset += this.options.fetchSize;
  }


  /** sets random related image to entity */
  private setRandomArtwork(entity) {
    /** load missing movement images */
    this.getEntityArtworks(this.options.entityType, entity.id)
      .then(artworks => {
        let randThumbIndex = -1;
        // search for random artwork which is no .tif
        do {
          // remove artwork from list if last assignment failed (not first cycle).
          if (randThumbIndex !== -1) {
            artworks.splice(randThumbIndex, 1);
          }
          // remove entity if no artworks available
          if (!artworks.length) {
            this.removeEntity(entity);
          }
          randThumbIndex = Math.floor(Math.random() * artworks.length);
        } while (artworks[randThumbIndex].image.endsWith('.tif') || artworks[randThumbIndex].image.endsWith('.tiff'));

        entity.image = artworks[randThumbIndex].image;
        entity.imageMedium = artworks[randThumbIndex].imageMedium;
        entity.imageSmall = artworks[randThumbIndex].imageSmall;
      }).finally(() => {
      return entity;
    });
  }

  /** fetch 20 artworks to choose from */
  private async getEntityArtworks(type: EntityType, parentId: string): Promise<Artwork[]> {
    return await this.dataService.findArtworksByType(type, [parentId], 20);
  }

  /** Handles items which cannot be displayed */
  onLoadingError(item: Entity) {
    if (item.id) {
      this.setRandomArtwork(item);
    } else {
      this.removeEntity(item);
    }
  }

  /** Removes items from the component. Index can be specified to remove without search (faster) */
  removeEntity(item: Entity, index?) {
    this.listEntities.splice(index ?
      this.listEntities.findIndex(i => {
        return i ? i.id === item.id : true;
      }) : index, 1);
    this.offset--;
  }
}
