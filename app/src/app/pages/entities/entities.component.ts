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

@Component({
  selector: 'app-entities',
  templateUrl: './entities.component.html',
  styleUrls: ['./entities.component.scss']
})
export class EntitiesComponent implements OnInit {

  /** all items to display */
  entities: any[] = [];
  /** offset of the query, this is where it will continue to load */
  offset = 0;
  /** type which is handled in the component */
  type: EntityType;
  /** the grater this is, the bigger the fetch */
  fetchSize = 20;
  /** the max number of elements */
  queryCount: number;

  constructor(private dataService: DataService, private route: ActivatedRoute) {
  }

  ngOnInit() {
    if (this.route.pathFromRoot[1]) {
      /** get type which shall be handled from url */
      this.route.pathFromRoot[1].url.subscribe(val => {
        const lastPathSegment = val[0].path.substr(0, val[0].path.length - 1);
        this.type = EntityType[lastPathSegment.toUpperCase() as keyof typeof EntityType];
        /** get max number of elements */
        this.dataService.countEntityItems(this.type).then(value => this.queryCount = value);
      });
    }
  }

  /** This gets called by the app-infinite-scroll component and fetches new data */
  onScroll() {
    /** if there is no more to get, don't fetch again */
    if (this.offset > this.queryCount) {
      return;
    }

    if (this.type) {
      this.entities.push(...Array(this.fetchSize).fill({}));

      /** Fetch dependant on type. Maybe there is potential for improvement here. */
      switch (this.type) {
        case EntityType.MOVEMENT:
          this.getEntities<Movement>(this.offset);
          break;
        case EntityType.ARTIST:
          this.getEntities<Artist>(this.offset);
          break;
        case EntityType.ARTWORK:
          this.getEntities<Artwork>(this.offset);
          break;
        case EntityType.GENRE:
          this.getEntities<Genre>(this.offset);
          break;
        case EntityType.LOCATION:
          this.getEntities<Location>(this.offset);
          break;
        case EntityType.MOTIF:
          this.getEntities<Motif>(this.offset);
          break;
        case EntityType.MATERIAL:
          this.getEntities<Material>(this.offset);
          break;
      }
    }
  }

  /** fetch new dataset, starting from offset x */
  private getEntities<T extends Entity>(offset: number) {
    this.offset += this.fetchSize;
    const capitalize = (str, lower = false) =>
      (lower ? str.toLowerCase() : str).replace(/(?:^|\s|["'([{])+\S/g, match => match.toUpperCase());
    this.getAllEntities<T>(offset).then(entities => {
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
      this.entities.splice(offset, this.fetchSize, ...entities);
    });
  }

  /** run query */
  private async getAllEntities<T>(offset: number): Promise<T[]> {
    return await this.dataService.getEntityItems<T>(this.type, this.fetchSize, offset);
  }

  /** sets random related image to entity */
  private setRandomArtwork(entity) {
    /** load missing movement images */
    this.getEntityArtworks(this.type, entity.id)
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
    this.entities.splice(index ?
      this.entities.findIndex(i => {
        return i ? i.id === item.id : true;
      }) : index, 1);
    this.offset--;
  }
}
