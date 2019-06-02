import { Component, Input, Output, EventEmitter, AfterViewInit, ElementRef } from '@angular/core';
import { Entity } from 'src/app/shared/models/models';
import { DataService } from 'src/app/core/services/data.service';

@Component({
  selector: 'app-slide',
  templateUrl: './slide.component.html',
  styleUrls: ['./slide.component.scss'],
})
export class SlideComponent implements AfterViewInit {
  @Input()
  loadStuff = false;

  public loadContent = false;

  /**
   * @description emits hovered artwork on hover event.
   * @type {EventEmitter<Entity>}
   * @memberof SliderComponent
   */
  @Output() onHover: EventEmitter<Entity> = new EventEmitter<Entity>();

  constructor(public dataService: DataService, private el: ElementRef) {}

  /**
   * @description Input: the item being passed.
   * @type {Entity}
   * @memberof SliderItemComponent
   */
  @Input() items: Entity[];

  ngAfterViewInit() {
    this.canLazyLoad() ? this.lazyLoad() : this.load();
  }
  private canLazyLoad() {
    return window && 'IntersectionObserver' in window;
  }

  private lazyLoad() {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(({ isIntersecting }) => {
        if (isIntersecting) {
          this.load();
          obs.unobserve(this.el.nativeElement);
        }
      });
    });
    obs.observe(this.el.nativeElement);
  }

  private load() {
    this.loadContent = true;
  }
}
