import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { IconclassService } from '../../core/services/iconclass/iconclass.service';
import { Iconography } from '../../shared/models/iconography.interface';
import { Entity } from '../../shared/models/entity.interface';

@Component({
  selector: 'app-iconography',
  templateUrl: './iconography.component.html',
  styleUrls: ['./iconography.component.scss']
})
export class IconographyComponent implements OnInit {
  notation: string;
  iconclassData: Iconography;
  hierarchy: Entity[];

  children: Iconography[] = [];
  parents: Iconography[] = [];

  private appInfoRef: ElementRef;
  /**
   * @description use this to end subscription to url parameter in ngOnDestroy
   */
  private ngUnsubscribe = new Subject();

  constructor(private iconclassService: IconclassService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe(async params => {
      this.notation = params.get('notation');
      this.iconclassService.getIconclassByNotation(this.notation).subscribe(async result => {
        console.log(result);
        if (!result) {
          this.handleError();
          return;
        }
        this.iconclassData = result;
        this.hierarchy = [this.iconclassData];

        console.log('#badge-' + this.iconclassData.id);
        this.iconclassService.getIconclassListByNotation(this.iconclassData.parents.map(value => value + '')).subscribe(async res => {
          this.parents = res;
          this.hierarchy = this.parents.concat(this.iconclassData);
        });
        this.iconclassService.getIconclassListByNotation(this.iconclassData.children.map(value => value + '')).subscribe(async res => {
          this.children = res;
          // this.hierarchy = this.parents.concat(this.iconclassData).concat(this.children);
        });
      });
    });
  }

  /**
   * @description Hook that is called when a directive, pipe, or service is destroyed.
   */
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  @ViewChild('appInfo', { static: false, read: ElementRef })
  @ViewChild('appInfo', { static: false, read: ElementRef })
  set content(content: ElementRef) {
    if (content) {
      // initially setter gets called with undefined
      this.appInfoRef = content;
      const hierarchyRoot = this.appInfoRef.nativeElement.querySelector('#badge-' + this.iconclassData.id);
      console.log(hierarchyRoot);
      // const hierarchyRoot = document.getElementById('badge-' + this.iconclassData.id);
      if (hierarchyRoot) {
        hierarchyRoot.className = 'current-element';
      } else {
        console.error('root badge not found!');
      }
    }
  }

  public handleError() {
    console.log('ERROR');
  }
}
