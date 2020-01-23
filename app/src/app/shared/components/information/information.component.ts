import {Component, OnInit, Input} from '@angular/core';
import {Entity} from '../../models/models';

@Component({
  selector: 'app-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss']
})
export class InformationComponent implements OnInit {

  /** TODO:REVIEW
   *   Use string type, not String
   */
  @Input()
  label: String;

  /** TODO:REVIEW
   *   Use string type, not String
   */
  @Input()
  value: String;

  @Input()
  values: Entity[];

  constructor() {
  }

  ngOnInit() {
    this.checkRequiredFields();
  }

  /** TODO:REVIEW
   *   Remove unused parameter changes
   */
  ngOnChanges(changes) {
    /** TODO:REVIEW
     *   What happens if label is null? handle thrown error
     */
    this.checkRequiredFields();
  }

  private checkRequiredFields() {
    if (this.label === null) {
      throw new TypeError('Attribute \'label\' is required');
    }
  }
}
