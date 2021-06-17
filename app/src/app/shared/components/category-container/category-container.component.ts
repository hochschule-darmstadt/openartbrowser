import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { usePlural } from '../../models/entity.interface';

@Component({
  selector: 'app-category-container',
  templateUrl: './category-container.component.html',
  styleUrls: ['./category-container.component.scss']
})
export class CategoryContainerComponent implements OnInit {
  @Input() category: any;

  isLoaded: boolean = false;
  
  usePlural = usePlural;

  constructor() { }

  ngOnInit(): void {
  }

  onImgPreloaded() {
    if(this.category !== undefined && !this.isLoaded) this.isLoaded = true;
  }

  /**
   * removes entity from category suggestions if image of item cannot be loaded
   * @param category category the item should be removed from
   * @param item item that should be removed
   */
  onLoadingError(category, item) {
    if(category) category.items = category.items.filter(i => item.id !== i.id);
  }

}
