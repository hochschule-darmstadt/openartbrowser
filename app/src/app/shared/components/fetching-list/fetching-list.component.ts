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
  @Input() listItems: any[] = [];
  @Output() fetchData = new EventEmitter();

  /** the query which shall be fetched */
  @Input() query: (offset: number) => Promise<Entity[]>;

  @Input() options: FetchOptions;

  @ContentChild(TemplateRef, { static: false }) templateRef;
  offset: number;

  throttle = 300;
  scrollDistance = 1;
  scrollUpDistance = 5;

  scrolling = false;
  paginatorSelectedPage: number;

  private pageAnchorElementId = '#pageAnchor-';

  constructor(private dataService: DataService, private route: ActivatedRoute) {
  }

  ngOnInit() {
    if (this.options.initOffset < 0 && this.options.fetchSize <= 0 && !this.options.entityType) {
      throw Error('Invalid fetching list options!');
    }
    this.offset = this.options.initOffset;
    this.onScrollDown();
  }

  /** This gets called by the app-infinite-scroll component and fetches new data */
  onScrollDown(event?) {
    console.log(event);
    /** if there is no more to get, don't fetch again */
    if (this.options.initOffset > this.options.queryCount) {
      return;
    }
    const currentOffset = this.offset;
    this.listItems.push(...Array(this.options.fetchSize).fill({}));
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
      // const items = entities as any[];
      // items[items.length / 2].pageStart = this.pageAnchorElementId + currentOffset / this.options.fetchSize;
      this.listItems.splice(currentOffset, this.options.fetchSize, ...entities);
    });
    this.offset += this.options.fetchSize;
  }

  onScrollUp(event?) {
    console.log(event);
    console.log('up');
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
    this.listItems.splice(index ?
      this.listItems.findIndex(i => {
        return i ? i.id === item.id : true;
      }) : index, 1);
    this.offset--;
  }

  onPageVisible($event: any) {

  }

  async loadSelectedPages(id) {
    this.paginatorSelectedPage = id;
    const currentPageCount = this.offset / this.options.fetchSize;
    console.log('Current Page Count: ', currentPageCount, 'id: ', id);
    if (id > currentPageCount - 1) {
      for (let i = 0; i <= id - currentPageCount ; i++) {
        // TODO: How to wait for this?
        await this.onScrollDown();
      }
    }
  }

  async scrollToPage() {
    this.scrolling = true;
    const el = document.getElementById(this.pageAnchorElementId + (this.paginatorSelectedPage - 1));
    console.log("Current scrolled anchor:", el);
    window.scrollTo({top: el.offsetTop, behavior: 'smooth'});
    // el.scrollIntoView({behavior: 'smooth'});

    this.paginatorSelectedPage = -1;
    this.scrolling = false;
  }

  placeAnchor(index): boolean {
    return index % this.options.fetchSize === 0;
  }

  getAnchorId(index): string {
    return this.pageAnchorElementId + (index / this.options.fetchSize);
  }

  anchorLoaded(index) {
    const loadedPage = Math.floor(index / this.options.fetchSize);
    // console.log("Loaded page. " + loadedPage, "selectedPage: ", this.paginatorSelectedPage);
    if (loadedPage === this.paginatorSelectedPage && !this.scrolling) {
      console.log("Scrolling to page " + loadedPage);
      this.scrollToPage();
    }
  }

}
