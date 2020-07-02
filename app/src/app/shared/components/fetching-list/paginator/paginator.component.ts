import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss']
})
export class PaginatorComponent implements OnInit {
  @Output() pageClick = new EventEmitter();

  pagenumber = 10;

  constructor() {
  }

  ngOnInit() {
  }
}
