import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataService } from 'src/app/core/services/data.service';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Iconclass, Artwork, EntityType } from 'src/app/shared/models/models';
import { Subject } from 'rxjs';
import { async } from '@angular/core/testing';

@Component({
  selector: 'app-iconclass',
  templateUrl: './iconclass.component.html',
  styleUrls: ['./iconclass.component.scss'],
})
export class IconclassComponent implements OnInit, OnDestroy {
  /** use this to end subscription to url parameter in ngOnDestroy */
  private ngUnsubscribe = new Subject();

  /** The entity this page is about */
  iconclass: Iconclass = null;

  /** Related artworks */
  sliderItems: Artwork[] = [];

  constructor(private dataService: DataService, private route: ActivatedRoute) {}

  /** hook that is executed at component initialization */
  ngOnInit() {
    /** Extract the id of entity from URL params. */
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe(async (params) => {
      const iconclassId = params.get('iconclassId');
      /** Use data service to fetch entity from database */
      this.iconclass = await this.dataService.findById<Iconclass>(iconclassId, EntityType.ICONCLASS);

      /** load slider items */
      await this.dataService.findArtworksByIconclasss([this.iconclass.id]).then((artworks) => {
        this.sliderItems = this.shuffle(artworks);
      });
    });
  }

  /**
   * @description shuffle the items' categories.
   * @memberof ArtworkComponent
   */
  shuffle = (a: Artwork[]): Artwork[] => {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
