import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss']
})
export class PaginatorComponent implements OnInit, OnChanges {
  @Output() pageClick = new EventEmitter();
  @Input() pageNumber: number;
  @Input() maxPage: number;

  pages: number[] = [];

  constructor() {
  }

  ngOnInit() {

  }

  ngOnChanges() {
    this.buildPages();
  }

  private buildPages() {
    const start = Math.max(+this.pageNumber - 2, 0);
    const end = Math.min(+this.pageNumber + 2, this.maxPage);
    const numbers = Array.from({ length: end - start + 1 }, (v, k) => k + start);
    const set = new Set(numbers);
    set.add(0);
    set.add(this.maxPage);
    this.pages = Array.from(set).sort((a, b) => a - b);
  }
}
