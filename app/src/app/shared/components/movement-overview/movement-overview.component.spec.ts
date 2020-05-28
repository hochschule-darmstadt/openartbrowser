import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MovementOverviewComponent } from './movement-overview.component';
import {Ng5SliderModule} from 'ng5-slider';
import {NgxFitTextModule} from 'ngx-fit-text';
import {RouterModule} from '@angular/router';
import {DataService} from '../../../core/services/elasticsearch/data.service';
import {HttpClient, HttpHandler} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

describe('MovementOverviewComponent', () => {
  let component: MovementOverviewComponent;
  let fixture: ComponentFixture<MovementOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [Ng5SliderModule, NgxFitTextModule, RouterModule.forRoot([]), BrowserAnimationsModule],
      declarations: [ MovementOverviewComponent ],
      providers: [DataService, HttpClient, HttpHandler]
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
