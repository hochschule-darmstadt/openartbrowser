import { Component, ViewEncapsulation, Input, OnInit, OnChanges } from '@angular/core';
import { Entity, Artwork } from '../../models/models';
import { usePlural, EntityIcon } from '../../models/entity.interface';

@Component({
  selector: 'app-badge',
  templateUrl: './badge.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./badge.component.scss']
})
export class BadgeComponent implements OnInit, OnChanges {
  @Input() entity: Entity;
  @Input() isHoverBadge: boolean;
  @Input() hoveredArtwork: Artwork;

  icon: string;
  label: string;
  redirectUrl: string;
  tooltip: string;
  highlight: boolean;
  isImageSourceValid: boolean = true;

  tooltipBreakLimit: number = 150;

  /**
   * When an Entity has been passed to the component
   *  - Load the Icon
   *  - Generate a redirect Route
   *  - Generate a tooltip: Either from Wikipedia Abstracts or the Wikidata description
   */
  ngOnInit() {
    if (this.entity) {
      this.icon = EntityIcon[this.entity.type] || 'fa-user';
      this.redirectUrl = `/${this.entity.type}/${this.entity.id}` || '/';
      this.label = this.entity.label || '';

      this.tooltip = this.entity.abstract || this.entity.description || null;
      if (this.tooltip) {
        this.tooltip.trim();
      }
    }


    /*
      Generate an abstract to show as tooltip.
      The Tooltip should not exceed the tooltipBreakLimit.
      If it is longer than defined we will look if we can break at the end of a sentence
      If we find not a full stop marking the end of a sentence we look for a whitespace which ends a word
      Else we cut in the middle of a word to keep the limit.

      Since Wikipedia often has phonetic transcriptions of the term in parentheses we remove these.
     */
    if (this.tooltip && this.tooltip.length >= this.tooltipBreakLimit) {
      let substrTo = this.tooltip.indexOf('.', this.tooltipBreakLimit);
      if (substrTo < this.tooltipBreakLimit) substrTo = this.tooltip.indexOf(' ', this.tooltipBreakLimit);
      if (substrTo < this.tooltipBreakLimit) substrTo = this.tooltipBreakLimit;
      this.tooltip = this.tooltip.substr(0, substrTo).replace(/ *\([^)]*\) */g, '')+ ' [...]';
    }
    else if(this.tooltip && this.tooltip.length < this.tooltipBreakLimit){

      this.tooltip = this.tooltip.substr(0).replace(/ *\([^)]*\) */g, '').charAt(0).toUpperCase() + this.tooltip.slice(1);

    }
  }

  ngOnChanges() {
    if (this.isHoverBadge) {
      this.highlight = false;
      if (this.hoveredArtwork) {
        this.highlight = this.hoveredArtwork[usePlural(this.entity.type)].includes(this.entity.id);
      }
    }
  }

  handleInvalidImageSource() {
    this.isImageSourceValid = false;
  }
}
