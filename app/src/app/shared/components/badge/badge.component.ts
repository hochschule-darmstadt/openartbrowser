import { Component, ViewEncapsulation, Input } from '@angular/core';

@Component({
  selector: 'app-badge',
  templateUrl: './badge.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./badge.component.scss']
})

export class BadgeComponent {

  /** the text that is shown in the badge */
  @Input() label: string = 'Add a custom label';

  /** the tooltip that is being shown when being hovered */
  @Input() tooltip: string = 'Insert your tooltip here';

  /** the font awesome icon class */
  @Input() icon: string = 'fa-wind';

  /** the url to which the badge should redirect when being clicked */
  @Input() redirectUrl: string = '/';

}