import {Component, OnInit} from '@angular/core';
import {DataService} from '../../core/services/elasticsearch/data.service';
import {ActivatedRoute} from '@angular/router';
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

  constructor(private dataService: DataService, private route: ActivatedRoute) {
  }

  ngOnInit() {
    /** get type which shall be handled from url */
    this.route.pathFromRoot[1].url.subscribe(val => {
      const lastPathSegment = val[0].path.substr(0, val[0].path.length - 1);
      this.type = EntityType[lastPathSegment.toUpperCase() as keyof typeof EntityType];
    });
  }

  /** This gets called by the app-infinite-scroll component and fetches new data */
  onScroll() {
    if (this.type) {
      this.getEntities(this.offset);

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
      this.entities.push(...entities);
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
        const randomArtworkId = Math.floor(Math.random() * artworks.length);
        entity.image = artworks[randomArtworkId].image;
        entity.imageMedium = artworks[randomArtworkId].imageMedium;
        entity.imageSmall = artworks[randomArtworkId].imageSmall;
      }).finally(() => {
      return entity;
    });
  }

  /** fetch 20 artworks to choose from */
  private async getEntityArtworks(type: EntityType, parentId: string): Promise<Artwork[]> {
    return await this.dataService.findArtworksByType(type, [parentId], 20);
  }

  /** Removes items from the component which cannot be displayed */
  onLoadingError(item: Entity) {
    this.entities.splice(
      this.entities.findIndex(i => i.id === item.id), 1
    );
  }

}
