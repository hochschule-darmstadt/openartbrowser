import { Component, LOCALE_ID, Inject, Input, Type, OnChanges } from '@angular/core';
import { Iconclass } from '../../models/models';
import { DataService } from 'src/app/core/services/elasticsearch/data.service';

@Component({
  selector: 'app-iconclass',
  templateUrl: './iconclass.component.html',
  styleUrls: ['./iconclass.component.scss'],
})
export class IconclassComponent implements OnChanges {
  @Input()
  label: string;

  @Input()
  iconclasses: Iconclass[];

  iconclassData: Array<IconclassData> = [];

  locale = 'en';

  constructor(private dataService: DataService, @Inject(LOCALE_ID) localeId: string) {
    this.locale = localeId.substr(0, 2);
  }

  ngOnChanges() {
    this.checkRequiredFields();
    this.loadData()
      .then(() => {})
      .catch((error) => {
        console.warn(error);
      });
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
      throw new TypeError("Attribute 'iconclasses' is required");
    }
  }
}

export interface IconclassData {
  n: Iconclass; // name
  p: Array<Iconclass>; // ancestors (parents)
  c: Array<Iconclass>; // children
  txt: IconclassTextTranslation; // text (translations)
  kw: IconclassTextTranslations; // keywords (translations)
}

export interface IconclassTextTranslations {
  fr: Array<string>;
  en: Array<string>;
  cn: Array<string>;
  de: Array<string>;
  it: Array<string>;
  fi: Array<string>;
}
export interface IconclassTextTranslation {
  fr: string;
  en: string;
  cn: string;
  de: string;
  it: string;
  fi: string;
}
