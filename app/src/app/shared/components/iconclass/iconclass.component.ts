import {Component, OnInit, LOCALE_ID, Inject, Input} from '@angular/core';
import {Iconclass} from '../../models/models';
import {DataService} from 'src/app/core/services/elasticsearch/data.service';

@Component({
  selector: 'app-iconclass',
  templateUrl: './iconclass.component.html',
  styleUrls: ['./iconclass.component.scss']
})
export class IconclassComponent implements OnInit {

  @Input()
  iconclasses: Iconclass[];

  /** TODO:REVIEW
   *   this should not be of type any[]. Implement a iconclass data type (inline) or cast it into a generic type like string[]
   */
  iconclassData: any[] = [];
  locale = 'en';

  constructor(private dataService: DataService, @Inject(LOCALE_ID) localeId: string) {
    this.locale = localeId.substr(0, 2);
  }

  /** TODO:REVIEW
   *    ngOnChanges is called before ngOnInit() and whenever one or more data-bound input properties change.
   *    So there is no need to use ngOnInit to run the same code.
   */
  ngOnInit() {
    this.checkRequiredFields();
    /* TODO:REVIEW
     *  add empty promise handler .then(() => {}) */
    this.loadData();
  }

  ngOnChanges(changes) {
    this.checkRequiredFields();
    /* TODO:REVIEW
     *  add empty promise handler .then(() => {}) */
    this.loadData();
  }

  private async loadData() {
    this.iconclassData = [];
    if (this.iconclasses) {
      const nonEmptyIconclasses = this.iconclasses.filter((i: Iconclass) => i !== '');
      if (nonEmptyIconclasses.length) {
        this.iconclassData = await this.dataService.getIconclassData(nonEmptyIconclasses);
      }
    }
  }

  private checkRequiredFields() {
    if (this.iconclasses === null) {
      throw new TypeError('Attribute \'iconclasses\' is required');
    }
  }
}
