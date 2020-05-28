import { Component, OnInit, Input } from '@angular/core';
import { Artwork } from '../../models/models';

@Component({
  selector: 'app-dimensions',
  templateUrl: './dimensions.component.html',
  styleUrls: ['./dimensions.component.scss']
})
export class DimensionsComponent implements OnInit {

  @Input() artwork: Artwork;
  /**
   * @description displays the dimensions of the artwork.
   */
  dimensionValue: string;

  /**
   * @description displays the label of the artwork dimensions.
   */
  dimensionLabel: string;

  illustrationHeight: number;
  illustrationWidth: number;

  hideIllustration = false;

  constructor() { }

  ngOnInit() {
    if (this.artwork) {
      this.setDimensions();
      this.calculateIllustrationDimensions();
    }
  }
  calculateIllustrationDimensions() {
    const scalingFactor = 0.53;
    if (this.artwork.height) {
      switch (this.artwork.height_unit) {
        case 'ft': this.illustrationHeight = scalingFactor * 30.48 * this.artwork.height; break;
        case 'm': this.illustrationHeight = scalingFactor * 100 * this.artwork.height; break;
        case 'cm': this.illustrationHeight = scalingFactor * this.artwork.height; break;
        case 'mm':  this.illustrationHeight = scalingFactor / 10 * this.artwork.height; break;
        case 'in':  this.illustrationHeight = scalingFactor * this.artwork.height * 2.54; break;
        default: break;
      }
    }
    if (this.artwork.width) {
      switch (this.artwork.width_unit) {
        case 'ft': this.illustrationWidth = scalingFactor * 30.48 * this.artwork.width; break;
        case 'm': this.illustrationWidth = scalingFactor * 100 * this.artwork.width; break;
        case 'cm': this.illustrationWidth = scalingFactor * this.artwork.width; break;
        case 'mm':  this.illustrationWidth = scalingFactor / 10 * this.artwork.width; break;
        case 'in':  this.illustrationWidth = scalingFactor * this.artwork.width * 2.54; break;
        default: break;
      }
    }
    // Hide Dimension Illustration if Artwork is smaller than 550cm or bigger than 9cm x 9cm
    if (this.illustrationHeight > 290 || this.illustrationWidth > 290 || (this.illustrationHeight < 5 && this.illustrationWidth < 5)) {
        this.hideIllustration = true;
    }
  }
  setDimensions() {
    if (this.artwork.diameter) {
      this.dimensionLabel = 'Diameter';
      /* Displays units if available. If not cm will be displayed */
      this.dimensionValue = this.artwork.diameter + (this.artwork.diameter_unit ? ' ' + this.artwork.diameter_unit : ' cm');
    } else if (this.artwork.height || this.artwork.width || this.artwork.length) {

        if ((this.artwork.height && this.artwork.width) ||
            (this.artwork.height && this.artwork.length) ||
            (this.artwork.width && this.artwork.length)) {
          this.dimensionLabel = 'Dimension';
        } else if (this.artwork.height) {
          this.dimensionLabel = 'Height';
        } else if (this.artwork.width) {
          this.dimensionLabel = 'Width';
        } else if (this.artwork.length) {
          this.dimensionLabel = 'Length';
        }

        /* Displays units if available. If not cm will be displayed */
        this.dimensionValue  = [
          this.artwork.height ? this.artwork.height + (this.artwork.height_unit ? ' ' + this.artwork.height_unit : ' cm') : '',
          this.artwork.width ? this.artwork.width + (this.artwork.width_unit ? ' ' + this.artwork.width_unit : ' cm') : '',
          this.artwork.length ? this.artwork.length + (this.artwork.length_unit ? ' ' + this.artwork.length_unit : ' cm') : '',
        ].filter(x => x).join(' x ');
      }
  }
}
