import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AnalyticsComponent } from './analytics.component';
import { Angulartics2RouterlessModule } from 'angulartics2/routerlessmodule';

describe('AnalyticsComponent', () => {
  let component: AnalyticsComponent;
  let fixture: ComponentFixture<AnalyticsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AnalyticsComponent],
      imports: [Angulartics2RouterlessModule.forRoot()]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
