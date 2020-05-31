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

  entities: any[] = [];
  offset = 0;
  type: EntityType;
  fetchSize = 20;

  constructor(private dataService: DataService, private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.pathFromRoot[1].url.subscribe(val => {
      const lastPathSegment = val[0].path.substr(0, val[0].path.length - 1);
      this.type = EntityType[lastPathSegment.toUpperCase() as keyof typeof EntityType];
      this.getEntities(this.offset);
    });
  }

  onScroll() {
    console.log('SCROLL!', this.offset);
    if (this.type) {
      console.log(this.type, this.entities);
      this.getEntities(this.offset);
    }

  }

  private getEntities(offset: number) {
    this.offset += this.fetchSize;
    const capitalize = (str, lower = false) =>
      (lower ? str.toLowerCase() : str).replace(/(?:^|\s|["'([{])+\S/g, match => match.toUpperCase());

    switch (this.type) {
      case EntityType.MOVEMENT:
        this.getAllEntities<Movement>(offset).then(entities => {
          entities.forEach(entity => {
            entity.label = capitalize(entity.label);
            if (!entity.image) {
              this.setRandomArtwork(entity);
            }
          });
          this.entities.push(...entities);
        });
        break;
      case EntityType.ARTIST:
        this.getAllEntities<Artist>(offset).then(entities => {
          entities.forEach(entity => {
            entity.label = capitalize(entity.label);
            if (!entity.image) {
              this.setRandomArtwork(entity);
            }
          });
          this.entities.push(...entities);
        });
        break;
      case EntityType.ARTWORK:
        this.getAllEntities<Artwork>(offset).then(entities => {
          entities.forEach(entity => {
            entity.label = capitalize(entity.label);
            if (!entity.image) {
              this.onLoadingError(entity);
            }
          });
          this.entities.push(...entities);
        });
        break;
      case EntityType.GENRE:
        this.getAllEntities<Genre>(offset).then(entities => {
          entities.forEach(entity => {
            entity.label = capitalize(entity.label);
            if (!entity.image) {
              this.setRandomArtwork(entity);
            }
          });
          this.entities.push(...entities);
        });
        break;
      case EntityType.LOCATION:
        this.getAllEntities<Location>(offset).then(entities => {
          entities.forEach(entity => {
            entity.label = capitalize(entity.label);
            if (!entity.image) {
              this.setRandomArtwork(entity);
            }
          });
          this.entities.push(...entities);
        });
        break;
      case EntityType.MOTIF:
        this.getAllEntities<Motif>(offset).then(entities => {
          entities.forEach(entity => {
            entity.label = capitalize(entity.label);
            if (!entity.image) {
              this.setRandomArtwork(entity);
            }
          });
          this.entities.push(...entities);
        });
        break;
      case EntityType.MATERIAL:
        this.getAllEntities<Material>(offset).then(entities => {
          entities.forEach(entity => {
            entity.label = capitalize(entity.label);
            if (!entity.image) {
              this.setRandomArtwork(entity);
            }
          });
          this.entities.push(...entities);
        });
        break;
    }

  }

  private async getAllEntities<T>(offset: number): Promise<T[]> {
    return await this.dataService.getEntityItems<T>(this.type, this.fetchSize, offset);
  }

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

  private async getEntityArtworks(type: EntityType, parentId: string): Promise<Artwork[]> {
    return await this.dataService.findArtworksByType(type, [parentId]);
  }

  /** Removes items from the component which cannot be displayed */
  onLoadingError(item: Entity) {
    this.entities.splice(
      this.entities.findIndex(i => i.id === item.id), 1
    );
  }

}
