import {AfterViewInit, Component, ContentChild, Input, OnDestroy, TemplateRef} from '@angular/core';
import {Entity} from "../../models/entity.interface";
import { usePlural } from '../../models/entity.interface';

@Component({
  selector: 'app-sticky-title',
  templateUrl: './sticky-title.component.html',
  styleUrls: ['./sticky-title.component.scss']
})
export class StickyTitleComponent implements OnDestroy, AfterViewInit {
  @Input() entity: Entity;
  @ContentChild(TemplateRef, {static: false}) templateRef;

  usePlural = usePlural;

  constructor() {
  }

  ngAfterViewInit() {
    window.onscroll = function () {
      StickyTitleComponent.scrollFunction()
    };
  }

  static scrollFunction() {
    const stickyTitle = document.getElementById("stickyTitle")
    if (stickyTitle && (document.body.scrollTop > 85 || document.documentElement.scrollTop > 85)) {
      stickyTitle.classList.add('sticky-title-fixed');
    } else {
      stickyTitle.classList.remove('sticky-title-fixed');
    }
  }

  ngOnDestroy() {
    window.onscroll = undefined;
  }
}
