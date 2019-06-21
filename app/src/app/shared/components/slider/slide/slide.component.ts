import { Component, Input, Output, EventEmitter, AfterViewInit, ElementRef, SimpleChanges, OnChanges } from '@angular/core';
import { Entity } from 'src/app/shared/models/models';
import { DataService } from 'src/app/core/services/data.service';

@Component({
  selector: 'app-slide',
  templateUrl: './slide.component.html',
  styleUrls: ['./slide.component.scss'],
})
export class SlideComponent implements AfterViewInit, OnChanges {
  /** whether slide images should be loaded */
  public loadContent = false;

  /**
   * @description Input: the items being passed.
   */
  @Input() items: Entity[];

  /**
   * @description emits hovered artwork on item hover event
   */
  @Output()
  itemHover: EventEmitter<Entity> = new EventEmitter<Entity>();

  constructor(public dataService: DataService, private el: ElementRef) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.items) {
      console.log(this.items);
    }
  }

  ngAfterViewInit() {
    if (window && 'IntersectionObserver' in window) {
      const obs = new IntersectionObserver(
        (entries) => {
          /** check whether any element of the slide is currently visible on screen */
          entries.forEach(({ isIntersecting }) => {
            if (isIntersecting) {
              this.loadContent = true;
              obs.unobserve(this.el.nativeElement);
            }
          });
        },
        { rootMargin: '100%' }
      );
      obs.observe(this.el.nativeElement);
    } else {
      this.loadContent = true;
    }
  }
}
