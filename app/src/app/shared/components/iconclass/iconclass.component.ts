import { Component, OnInit, LOCALE_ID, Inject, Input } from '@angular/core';
import { Iconclass } from '../../models/models';
import { DataService } from 'src/app/core/services/elasticsearch/data.service';

@Component({
  selector: 'app-iconclass',
  templateUrl: './iconclass.component.html',
  styleUrls: ['./iconclass.component.scss']
})
export class IconclassComponent implements OnInit {

  @Input()
  iconclasses: Iconclass[];

  iconclassData: any[] = [];
  locale: string = 'en';

  constructor(private dataService: DataService, @Inject(LOCALE_ID) locale_id: string) {
    this.locale = locale_id.substr(0, 2);
  }

  ngOnInit() {
    this.checkRequiredFields();
    this.loadData();
  }

  ngOnChanges(changes) {
    this.checkRequiredFields();
    this.loadData();
  }

  private async loadData() {
    this.iconclassData = [];
    if (this.iconclasses) {
      const nonEmptyIconclasses = this.iconclasses.filter((i: Iconclass) => i !== '');
      if (nonEmptyIconclasses.length)
        this.iconclassData = await this.dataService.getIconclassData(nonEmptyIconclasses);
    }
  }

  private checkRequiredFields() {
    if (this.iconclasses === null) {
      throw new TypeError("Attribute 'iconclasses' is required");
    }
  }
}
