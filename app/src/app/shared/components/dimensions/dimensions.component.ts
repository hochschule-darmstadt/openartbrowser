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

  constructor() { }

  ngOnInit() {
    if (this.artwork) {
      this.setDimensions();
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
