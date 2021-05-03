import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-category-container',
  templateUrl: './category-container.component.html',
  styleUrls: ['./category-container.component.scss']
})
export class CategoryContainerComponent implements OnInit {
  @Input() category: any;

  constructor() { }

  ngOnInit(): void {
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
