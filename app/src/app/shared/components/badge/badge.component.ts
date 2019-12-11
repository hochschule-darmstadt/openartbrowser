import { Component, ViewEncapsulation, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-badge',
  templateUrl: './badge.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./badge.component.scss']
})

export class BadgeComponent implements OnInit {

  /** the text that is shown in the badge */
  @Input() label: string = 'Add a custom label';

  /** the tooltip that is being shown when being hovered */
  @Input() tooltip: string = 'Insert your tooltip here';

  /** the font awesome icon class */
  @Input() type: string = 'movement';

  /** the url to which the badge should redirect when being clicked */
  @Input() redirectUrl: string = '/';

  icon: string;

  ngOnInit() {
    this.icon = icons[this.type];
    if (this.tooltip && this.tooltip.length) this.tooltip = this.tooltip.trim().substring(0, this.tooltip.indexOf('.', 150) + 1) + ' [...]'
  }

}

enum icons {
  artist = "fa-user",
  influencer = "fa-user",
  artwork = "fa-image",
  movement = "fa-wind",
  location = "fa-archway",
  motif = "fa-image",
  genre = "fa-tag",
  material = "fa-scroll"
}