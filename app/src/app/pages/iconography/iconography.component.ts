import { Component, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { IconclassService } from '../../core/services/iconclass/iconclass.service';
import { Iconography } from '../../shared/models/iconography.interface';

@Component({
  selector: 'app-iconography',
  templateUrl: './iconography.component.html',
  styleUrls: ['./iconography.component.scss']
})
export class IconographyComponent implements OnInit {
  notation: string;
  iconclassData: Iconography;
  /**
   * @description use this to end subscription to url parameter in ngOnDestroy
   */
  private ngUnsubscribe = new Subject();

  constructor(private iconclassService: IconclassService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe(async params => {
      this.notation = params.get('notation');
      this.iconclassService.getIconclassByNotation(this.notation).subscribe(async result => {
        console.log(result);
        if (!result) {
          this.handleError();
          return;
        }
        this.iconclassData = result;
        console.log(this.iconclassData);
      });
    });
  }

  /**
   * @description Hook that is called when a directive, pipe, or service is destroyed.
   */
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public handleError() {}
}
