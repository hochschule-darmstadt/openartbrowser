import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-collapse',
  templateUrl: './collapse.component.html',
  styleUrls: ['./collapse.component.scss']
})
export class CollapseComponent implements OnInit {
  /** Change collapse icon; true if more infos are folded in */
  @Input('collapse') collapse = true;

  @Input('showVideo') showVideo = false;

  constructor() {
  }

  ngOnInit() {
  }

  toggle() {
    this.collapse = !this.collapse;
  }
}
