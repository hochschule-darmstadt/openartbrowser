import {
  ChangeDetectorRef,
  Component,
  ContentChild, ElementRef,
  EventEmitter,
  Input, OnChanges, OnDestroy,
  OnInit,
  Output,
  TemplateRef
} from '@angular/core';
import {Entity, EntityType} from '../../models/entity.interface';
import {DataService} from '../../../core/services/elasticsearch/data.service';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {KeyValue} from '@angular/common';
import {elasticEnvironment} from '../../../../environments/environment';
import {Artwork} from '../../models/models';
import {Location} from '@angular/common';

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
export class FetchingListComponent implements OnInit, OnDestroy, OnChanges {

  /** all pages to display, pageNumber starts at 0 */
  pages: { [pageNumber: number]: Page; } = {};
  @Output() fetchData = new EventEmitter();

  /** the query which shall be fetched */
  @Input() query: (offset: number) => Promise<Entity[]>;

  @Input() options: FetchOptions;

  @ContentChild(TemplateRef, {static: false}) templateRef;
  @ContentChild('templateContainer', {static: false}) templateContainer: ElementRef;

  maxPage: number;
  currentPage: number;

  pageAnchorElementId = '#pageAnchor-';
  private scrollingPageNum = -1;

  // order by ascending property key (as number)
  keyAscOrder = (a: KeyValue<number, Page>, b: KeyValue<number, Page>): number => {
    return +a.key < +b.key ? -1 : (+b.key < +a.key ? 1 : 0);
  };

  constructor(private dataService: DataService,
              private router: Router,
              private route: ActivatedRoute,
              private changeDetectionRef: ChangeDetectorRef,
              private location: Location) {
  }

  ngOnInit() {
    if (!this.options) {
      // can't start without options
      return;
    }
    if (this.options.initOffset < 0 && this.options.fetchSize <= 0 && !this.options.entityType) {
      // check of options failed
      throw Error('Invalid fetching list options!');
    }
    if (this.options.queryCount) {
      // queryCount is a promise for a number or a number => ready for init
      this.init()
    }
  }

  ngOnChanges() {
    if (this.options.queryCount) {
      // queryCount is a promise for a number or a number => ready for init
      this.init()
    }
  }

  /**
   * Initializes the page to the given page parameter or initOffset if no page given
   */
  init() {
    let pageParam = +this.route.snapshot.queryParamMap.get('page');

    this.options.queryCount.then(value => {
      this.options.queryCount = value;
      // TODO: If the queryCount exceeds the elasticSearch safeguard (default 10000), maxPage is limited.
      //  Find a way to prevent exceeding this limit (eg. use scroll api or search after)
      if (!this.options.queryCount) {
        this.maxPage = Object.keys(this.pages).length - 1;
      } else if (this.options.queryCount <= elasticEnvironment.nonScrollingMaxQuerySize) {
        this.maxPage = Math.ceil(this.options.queryCount / this.options.fetchSize) - 1;
      } else {
        this.maxPage = Math.floor(elasticEnvironment.nonScrollingMaxQuerySize / this.options.fetchSize) - 1;
      }
      if (pageParam) {
        if (pageParam > this.maxPage || pageParam < 0) {
          // make sure pageParam is between 0 and maxPage
          pageParam = Math.max(0, Math.min(this.maxPage, pageParam));
        }
        this.setCurrentPage(pageParam);
      } else {
        this.currentPage = Math.floor(this.options.initOffset / this.options.fetchSize);
      }
      this.initializePage(this.currentPage).then();
    });

  }

  ngOnDestroy() {
    // Remove query params
    this.router.navigate([], {
      queryParams: {'page': null},
      queryParamsHandling: 'merge'
    }).then();
  }

  /** this gets called by the app-infinite-scroll component and fetches new data */
  onScrollDown() {
    if (!this.maxPage) {
      return;
    }
    /** if there is no more to get, don't fetch again */
    if (this.currentPage >= this.maxPage) {
      return;
    }
    this.setCurrentPage(+this.currentPage + 1);
    this.initializePage(+this.currentPage).then();
  }

  /** sets random related image to entity */
  private setRandomArtwork(entity, pageNumber) {
    if (entity.type === EntityType.ARTWORK) {
      this.setError(entity, pageNumber);
    }
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
        this.setError(entity, pageNumber);
      }
    });
  }

  /** fetch 20 artworks to choose from */
  private async getEntityArtworks(type: EntityType, parentId: string): Promise<Artwork[]> {
    return await this.dataService.findArtworksByType(type, [parentId], 20);
  }

  /** handles items which cannot be displayed */
  onLoadingError(item: Entity, pageNumber) {
    if (item.id) {
      this.setRandomArtwork(item, pageNumber);
    } else {
      this.setError(item, pageNumber);
    }
  }

  /** removes (broken) image link from item and sets error property to true */
  setError(item: Entity, pageNumber, index?) {
    // instead of removing items, we replace them with error items
    if (!index) {
      index = this.pages[pageNumber].items.findIndex(i => {
        return i ? i.id === item.id : true;
      });
    }
    this.pages[pageNumber].items[index] = Object.assign(this.pages[pageNumber].items[index], {
      image: undefined,
      imageMedium: undefined,
      imageSmall: undefined,
      error: true
    });
  }

  /**
   * Determines whether a page is already loaded. If not, triggers loading
   * @param pageNumber
   */
  initializePage(pageNumber): Promise<any> {
    if (!(pageNumber in this.pages)) {
      // Fill page with empty items
      this.pages[pageNumber] = {
        items: Array(this.options.fetchSize).fill({error: false})
      } as Page;
      return this.loadPage(pageNumber);
    } else {
      return Promise.resolve();
    }
  }

  /**
   * Loads a given page by its number and this.query
   * returns Promise
   * @param pageNumber
   */
  async loadPage(pageNumber) {
    const offset = pageNumber * this.options.fetchSize;
    /** if there is no more to get, don't fetch again */
    if (offset > this.options.queryCount) {
      return Promise.resolve();
    }
    const capitalize = (str, lower = false) =>
      (lower ? str.toLowerCase() : str).replace(/(?:^|\s|["'([{])+\S/g, match => match.toUpperCase());

    return this.query(offset).then(entities => {
      entities.forEach(entity => {
        entity.label = capitalize(entity.label);
        /** if image link is missing, query for random image */
        if (!entity.image) {
          this.setRandomArtwork(entity, pageNumber);
        }
        // insert further entity processing here
      });
      /** replace empty objects with fetched objects.
       *  This has the advantage of no further sorting of this.entities (which may be very large)
       */
      this.pages[pageNumber].items = entities;
    });
  }

  /**
   * Listener to scroll to a page (paginator clicked)
   * @param pageNumber the number of target page
   */
  async scrollToPage(pageNumber) {
    if (pageNumber < 0 || +pageNumber === +this.currentPage) {
      return;
    }

    // find all pages +-1 of the given pageNumber to load them
    const waitQueue: Promise<any>[] = [];
    for (let i = Math.max(pageNumber - 1, 0); i <= Math.min(pageNumber + 1, this.maxPage); i++) {
      const initResult = this.initializePage(i);
      waitQueue.push(initResult);
    }
    // load the queue
    await Promise.all(waitQueue);

    // find the requested page in the document to scroll it into the viewport
    const el = document.getElementById(this.pageAnchorElementId + +pageNumber);
    this.scrollingPageNum = pageNumber;

    await window.scrollTo({top: el.offsetTop, behavior: 'smooth'});
  }

  /**
   * Listener for the page anchor. Determines what pages should be loaded
   * @param $event contains the emitter ID and whether it is in viewport (visible)
   */
  onPageVisible($event: any) {
    if ($event.visible) {
      const anchorId = +($event.target.id.split('-').pop());
      this.setCurrentPage(anchorId);
      if (this.scrollingPageNum !== -1) {
        if (+this.currentPage === +this.scrollingPageNum) {
          this.scrollingPageNum = -1;
        } else {
          return;
        }
      } else {
        // pages +-2 of currentPage should be checked
        const pagesToCheck = this.range(Math.max(+this.currentPage - 2, 0), Math.min(+this.currentPage + 2, this.maxPage));
        for (const i of pagesToCheck) {
          const preScrollHeight = FetchingListComponent.getContainerScrollHeight();
          const preScrollOffset = FetchingListComponent.getContainerScrollTop();
          const pageToLoad = i;
          if (pageToLoad in this.pages || pageToLoad < 0) {
            // skip if page is already loaded
            continue;
          }
          // load the page
          this.initializePage(pageToLoad).then();
          if (pageToLoad < +this.currentPage) {
            // loaded page was inserted above the currentPage => scroll to the currentPage
            this.changeDetectionRef.detectChanges();
            const postScrollOffset = FetchingListComponent.getContainerScrollTop();
            if ((preScrollOffset || preScrollOffset === 0) &&
              (postScrollOffset || postScrollOffset === 0) &&
              (preScrollOffset === postScrollOffset)) {
              const postScrollHeight = FetchingListComponent.getContainerScrollHeight();
              const deltaHeight = (postScrollHeight - preScrollHeight);
              FetchingListComponent.setScrollTop(postScrollOffset, deltaHeight);
            }
          }
        }
      }
    }
  }

  /**
   * Changes url parameters and currentPage
   * @param newPageNumber
   * @private
   */
  private setCurrentPage(newPageNumber: number) {
    this.currentPage = newPageNumber;
    this.setURLPageParam(newPageNumber);
    return newPageNumber;
  }

  /**
   * Sets the url param 'page' without a history entry and triggering a reload
   * @param page the new page number
   * @private
   */
  private setURLPageParam(page: number) {
    const queryParams: Params = {page: page};
    const url = this.router.createUrlTree(
      [], {
        queryParams: queryParams,
        queryParamsHandling: 'merge',
        preserveFragment: true,
        replaceUrl: true
      }).toString();
    this.location.replaceState(url)
  }

  range(start, end): Array<number> {
    return Array.from({length: end - start + 1}, (v, k) => k + start);
  }

  /**
   * returns the current vertical position at the page
   * @private
   */
  private static getContainerScrollHeight(): number {
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

  private static getContainerScrollTop(): number {
    return (window.pageYOffset);
  }

  private static setScrollTop(currentScrollTop: number, delta: number): void {
    window.scrollBy(0, delta);
  }
}
