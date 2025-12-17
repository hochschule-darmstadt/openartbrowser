import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {MovementOverviewComponent} from './movement-overview.component';
import {RouterModule} from '@angular/router';
import {DataService} from '../../../core/services/elasticsearch/data.service';
import {HttpClientModule} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgxSliderModule} from "@angular-slider/ngx-slider";

describe('MovementOverviewComponent', () => {
  let component: MovementOverviewComponent;
  let fixture: ComponentFixture<MovementOverviewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [NgxSliderModule, RouterModule.forRoot([], {}), BrowserAnimationsModule, HttpClientModule],
      declarations: [MovementOverviewComponent],
      providers: [DataService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MovementOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
