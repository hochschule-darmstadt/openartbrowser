import {
  ChangeDetectorRef,
  Component,
  ContentChild,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef
} from '@angular/core';
import { Entity, EntityType } from '../../models/entity.interface';
import { Artwork } from '../../models/artwork.interface';
import { DataService } from '../../../core/services/elasticsearch/data.service';
import { ActivatedRoute } from '@angular/router';
import { KeyValue } from '@angular/common';

export interface FetchOptions {
  /** initial offset of the query, this is where it will continue to load */
  initOffset: number;
  /** the grater this is, the bigger the fetch */
  fetchSize: number;
  /** the max number of elements or its Promise */
  queryCount: any;
  /** type which is handled in the component */
  entityType: EntityType;
}

export interface Page {
  num: number;
  items: any[];
}

@Component({
  selector: 'app-fetching-list',
  templateUrl: './fetching-list.component.html',
  styleUrls: ['./fetching-list.component.scss']
})
export class FetchingListComponent implements OnInit {

  /** all pages to display, pageNumber starts at 0 */
  pages: { [pageNumber: number]: Page; } = {};
  @Output() fetchData = new EventEmitter();

  /** the query which shall be fetched */
  @Input() query: (offset: number) => Promise<Entity[]>;

  @Input() options: FetchOptions;

  @ContentChild(TemplateRef, { static: false }) templateRef;

  // TODO: Input these to paginator to handle display stuff
  maxPage: number;
  currentPage: number;

  pageAnchorElementId = '#pageAnchor-';
  private scrollingPageNum = -1;

  // Order by ascending property key (as number)
  keyAscOrder = (a: KeyValue<number, Page>, b: KeyValue<number, Page>): number => {
    return +a.key < +b.key ? -1 : (+b.key < +a.key ? 1 : 0);
  };

  constructor(private dataService: DataService, private route: ActivatedRoute, private changeDetectionRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    if (this.options.initOffset < 0 && this.options.fetchSize <= 0 && !this.options.entityType) {
      throw Error('Invalid fetching list options!');
    }
    console.log(this.options.queryCount, this.options.fetchSize,
      Math.ceil(this.options.queryCount / this.options.fetchSize), this.options);
    this.options.queryCount.then(value => {
      this.options.queryCount = value;

      console.log(this.options.queryCount);
      this.maxPage = Math.ceil(this.options.queryCount / this.options.fetchSize);
      this.currentPage = Math.floor(this.options.initOffset / this.options.fetchSize);
      this.initializePage(this.currentPage);
    });

  }

  // TODO: Fix scroll up and down recognition for gaps in pages
  /** This gets called by the app-infinite-scroll component and fetches new data */
  onScrollDown(event?) {
    if (!this.maxPage) {
      return;
    }
    console.log(event);
    /** if there is no more to get, don't fetch again */
    if (this.currentPage >= this.maxPage) {
      return;
    }
    this.currentPage++;
    this.initializePage(this.currentPage);
  }

  onScrollUp(event?) {
    console.log(event);
    console.log('up');
    if (this.currentPage <= 0) {
      return;
    }
    this.currentPage--;
    this.initializePage(this.currentPage);
  }

  /** sets random related image to entity */
  private setRandomArtwork(entity, pageNumber) {
    /** load missing movement images */
    this.getEntityArtworks(this.options.entityType, entity.id).then(artworks => {
      let randThumbIndex = -1;
      // search for random artwork which is no .tif
      artworks = artworks.filter(artwork => !artwork.image.endsWith('.tif') && !artwork.image.endsWith('.tiff'));
      if (artworks.length) {
        randThumbIndex = Math.floor(Math.random() * artworks.length);
        entity.image = artworks[randThumbIndex].image;
        entity.imageMedium = artworks[randThumbIndex].imageMedium;
        entity.imageSmall = artworks[randThumbIndex].imageSmall;
      } else {
        this.removeEntity(entity, pageNumber);
      }
    });
  }

  /** fetch 20 artworks to choose from */
  private async getEntityArtworks(type: EntityType, parentId: string): Promise<Artwork[]> {
    return await this.dataService.findArtworksByType(type, [parentId], 20);
  }

  /** Handles items which cannot be displayed */
  onLoadingError(item: Entity, pageNumber) {
    if (item.id) {
      this.setRandomArtwork(item, pageNumber);
    } else {
      this.removeEntity(item, pageNumber);
    }
  }

  /** Removes items from the component. Index can be specified to remove without search (faster) */
  removeEntity(item: Entity, pageNumber, index?) {
    delete this.pages[pageNumber].items[!index ?
      this.pages[pageNumber].items.findIndex(i => {
        return i ? i.id === item.id : true;
      }) : index];
  }

  initializePage(pageNumber) {
    if (!(pageNumber in this.pages)) {
      this.pages[pageNumber] = {
        items: Array(this.options.fetchSize).fill({})
      } as Page;
      return this.loadPage(pageNumber);
    }
  }

  async loadPage(pageNumber) {
    const offset = pageNumber * this.options.fetchSize;
    /** if there is no more to get, don't fetch again */
    if (offset > this.options.queryCount) {
      return;
    }
    const capitalize = (str, lower = false) =>
      (lower ? str.toLowerCase() : str).replace(/(?:^|\s|["'([{])+\S/g, match => match.toUpperCase());

    return this.query(offset).then(entities => {
      entities.forEach(entity => {
        entity.label = capitalize(entity.label);
        /** If image link is missing, query for random image */
        if (!entity.image) {
          this.setRandomArtwork(entity, pageNumber);
        }
        // insert further entity processing here
      });
      /** replace empty objects with fetched objects.
       *  This has the advantage of no further sorting of this.entities (which may be very large)
       */
      this.pages[pageNumber].items = entities;
      console.log('page ' + pageNumber + ' loaded');
    });
  }

  async scrollToPage(pageNumber) {
    if (pageNumber < 0 || +pageNumber === +this.currentPage) {
      return;
    }
    console.log(pageNumber, this.maxPage, this.currentPage);

    const waitQueue: Promise<any>[] = [];
    for (let i = Math.max(pageNumber - 1, 0); i <= Math.min(pageNumber + 1, this.maxPage); i++) {
      const initResult = this.initializePage(i);
      waitQueue.push(initResult);
    }
    const result = await Promise.all(waitQueue);

    const el = document.getElementById(this.pageAnchorElementId + pageNumber);
    console.log(el);
    this.scrollingPageNum = pageNumber;

    await window.scrollTo({ top: el.offsetTop, behavior: 'smooth' });
    console.log(this.pages);
  }

  onPageVisible($event: any) {
    if ($event.visible) {
      this.currentPage = $event.target.id.split('-').pop();
      if (this.scrollingPageNum !== -1) {
        console.log('current page:', this.currentPage, 'scrollingPageNum', this.scrollingPageNum);
        if (+this.currentPage === +this.scrollingPageNum) {
          this.scrollingPageNum = -1;
        } else {
          return;
        }
      }
      if (this.scrollingPageNum === -1) {
        const pagesToCheck = this.range(Math.max(+this.currentPage - 2, 0), Math.min(+this.currentPage + 2, this.maxPage));
        const preScrollHeight = this.getContainerScrollHeight();
        const preScrollOffset = this.getContainerScrollTop();
        for (const i of pagesToCheck) {
          const pageToLoad = i;
          if (pageToLoad in this.pages || pageToLoad < 0) {
            continue;
          }
          this.initializePage(pageToLoad);
          if (pageToLoad < this.currentPage) {
            this.changeDetectionRef.detectChanges();
            const postScrollOffset = this.getContainerScrollTop();
            if (preScrollOffset && postScrollOffset && (preScrollOffset === postScrollOffset)) {
              const postScrollHeight = this.getContainerScrollHeight();
              const deltaHeight = (postScrollHeight - preScrollHeight);
              this.setScrollTop(postScrollOffset, deltaHeight);

              console.warn('Scrolling by', deltaHeight, 'px');
            }
          }
        }
      }
      console.log('current page:', $event.target.id.split('-').pop(), this.currentPage);
    }
  }

  range(start, end): Array<number> {
    return Array.from({ length: end - start + 1 }, (v, k) => k + start);
  }

  private getContainerScrollHeight(): number {
    return (
      Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.body.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight,
        document.documentElement.clientHeight
      )
    );

  }

  private getContainerScrollTop(): number {
    return (window.pageYOffset);
  }

  private setScrollTop(currentScrollTop: number, delta: number): void {
    window.scrollBy(0, delta);
  }
}
