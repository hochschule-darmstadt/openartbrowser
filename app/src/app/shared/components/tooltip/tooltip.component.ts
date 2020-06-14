import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss']
})
export class TooltipComponent implements OnInit {
  /**
   * @description the tooltip text
   */
  @Input() text: string;

  /**
   * @description image source that should be displayed in tooltip
   */
  @Input() image: string;

  /**
   * @description The word to be hoovered over to display the tooltip.
   */
  @Input() highlighting: string;

  showTooltip: boolean;

  tooltipTimer: any;

  tooltipXPosition: 'left' | 'right';
  tooltipYPosition: 'top' | 'bottom' = 'bottom';

  constructor() {}

  ngOnInit() {
    this.showTooltip = false;
  }

  calculateTooltipPosition() {
    this.tooltipTimer = setTimeout(() => {
      const tooltipDiv = document.getElementById('tooltip-container').getBoundingClientRect();
      const positionBottom = tooltipDiv.top + tooltipDiv.height;
      const windowHeight = window.innerHeight;

      if ( tooltipDiv.right <= (window.innerWidth || document. documentElement.clientWidth)) {
        this.tooltipXPosition = 'left';
      } else {
        this.tooltipXPosition = 'right';
      }

      if (positionBottom + 32 < windowHeight) {
        this.tooltipYPosition = 'bottom';
      } else {
        this.tooltipYPosition = 'top';
      }
      this.showTooltip = true;
    }, 300);
  }

  hideTooltip() {
    clearTimeout(this.tooltipTimer);
    this.showTooltip = false;
    this.tooltipYPosition = 'bottom';
    this.tooltipXPosition = 'left';
  }
}
