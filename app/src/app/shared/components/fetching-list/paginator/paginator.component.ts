import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss']
})
export class PaginatorComponent implements OnInit {
  @Output() pageClick = new EventEmitter();
  @Input() pageNumber: number;

  pages: number[] = [];

  constructor() {
  }

  ngOnInit() {
    for (let i = 0; i < 10; i++) {
      this.pages.push(i);
    }
  }
}
