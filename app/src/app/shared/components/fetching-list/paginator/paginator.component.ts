import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss']
})
export class PaginatorComponent implements OnInit {
  @Output() pageClick = new EventEmitter();

  pages = [];

  pagenumber = 10;

  constructor() {
  }

  ngOnInit() {
    for (let i = 0; i < 10; i++) {
      this.pages.push(i);
    }
  }
}
