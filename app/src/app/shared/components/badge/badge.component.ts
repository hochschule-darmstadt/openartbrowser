import { Component, ViewEncapsulation, Input, OnInit } from '@angular/core';  
import { Entity } from '../../models/models';

@Component({
  selector: 'app-badge',
  templateUrl: './badge.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./badge.component.scss']
})

export class BadgeComponent implements OnInit {

  /** the font awesome icon class */
  @Input() entity: Entity;

  icon: string;
  label: string;
  redirectUrl: string;
  tooltip: string;

  ngOnInit() {
    this.icon = icons[this.entity.type] || 'fa-user';
    this.tooltip = this.entity.abstract || this.entity.description || '';
    this.redirectUrl = `/${this.entity.type}/${this.entity.id}` || '/';
    this.label = this.entity.label || '';
    if (this.tooltip && this.tooltip.length) this.tooltip = this.tooltip.trim().substring(0, this.tooltip.indexOf('.', 150) + 1) + ' [...]'
  }

}

enum icons {
  artist = "fa-user",
  artwork = "fa-image",
  movement = "fa-wind",
  location = "fa-archway",
  motif = "fa-image",
  genre = "fa-tag",
  material = "fa-scroll"
}