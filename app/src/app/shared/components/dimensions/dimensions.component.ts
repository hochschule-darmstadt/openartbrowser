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

  /**
   * @description indicates the height of the illustration.
   */
  illustrationHeight: number;

  /**
   * @description indicates the width of the illustration.
   */
  illustrationWidth: number;

  /**
   * @description hides/shows illustration.
   */
  hideIllustration = false;

  constructor() { }

  ngOnInit() {
    if (this.artwork) {
      this.setDimensions();
      this.setIllustrationDimensions();
    }
  }
  setIllustrationDimensions() {
    this.illustrationHeight = this.calculateIllustrationDimension(this.artwork.height_unit, this.artwork.height);
    this.illustrationWidth = this.calculateIllustrationDimension(this.artwork.width_unit, this.artwork.width);
    // Hide Dimension Illustration if Artwork is smaller than 9cm x 9cm or bigger than 35m
    if (this.illustrationHeight > 1855 || (this.illustrationHeight < 5 && this.illustrationWidth < 5)) {
        this.hideIllustration = true;
    }
  }

  calculateIllustrationDimension(dimensionUnit, dimension) {
    if (!dimension) {
      return 0;
    }
    const scalingFactor = 0.53;
    switch (dimensionUnit) {
      case 'ft': return scalingFactor * 30.48 * dimension;
      case 'm': return  scalingFactor * 100 * dimension;
      case 'cm': return  scalingFactor * dimension;
      case 'mm': return  scalingFactor / 10 * dimension;
      case 'in': return  scalingFactor * dimension * 2.54;
      default: return 0;
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

        if (
          (this.artwork.height && this.artwork.width && this.artwork.height_unit !== this.artwork.width_unit) ||
          (this.artwork.height && this.artwork.length && this.artwork.height_unit !== this.artwork.length_unit) ||
          (this.artwork.width && this.artwork.length && this.artwork.width_unit !== this.artwork.length_unit)
          ) {
            this.dimensionValue  = [
              this.artwork.height ? this.artwork.height + (this.artwork.height_unit ? ' ' + this.artwork.height_unit : ' cm') : '',
              this.artwork.width ? this.artwork.width + (this.artwork.width_unit ? ' ' + this.artwork.width_unit : ' cm') : '',
              this.artwork.length ? this.artwork.length + (this.artwork.length_unit ? ' ' + this.artwork.length_unit : ' cm') : '',
            ].filter(x => x).join(' x ');
          } else {

            this.dimensionValue  = [
              this.artwork.height ? this.artwork.height : '',
              this.artwork.width ? this.artwork.width : '',
              this.artwork.length ? this.artwork.length : '',
            ].filter(x => x).join(' x ') + (this.artwork.height ?
              + ' ' + this.artwork.height_unit : (this.artwork.width_unit ? + ' ' + this.artwork.width_unit :
              ( + ' ' + this.artwork.length_unit ? + ' ' + this.artwork.width_unit : ' cm')
              ));
          }


       /* this.dimensionValue  = [
          this.artwork.height ? this.artwork.height + (this.artwork.height_unit ? ' ' + this.artwork.height_unit : ' cm') : '',
          this.artwork.width ? this.artwork.width + (this.artwork.width_unit ? ' ' + this.artwork.width_unit : ' cm') : '',
          this.artwork.length ? this.artwork.length + (this.artwork.length_unit ? ' ' + this.artwork.length_unit : ' cm') : '',
        ].filter(x => x).join(' x ');*/
      }
  }
}
