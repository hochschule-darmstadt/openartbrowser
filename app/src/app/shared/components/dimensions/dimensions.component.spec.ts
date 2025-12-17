import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { InformationComponent } from '../information/information.component';
import { DimensionsComponent } from './dimensions.component';
import { BadgeComponent } from '../badge/badge.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';

describe('DimensionsComponent', () => {
  let component: DimensionsComponent;
  let fixture: ComponentFixture<DimensionsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [NgbModule, RouterModule.forRoot([], {})],
      declarations: [
        DimensionsComponent,
        InformationComponent,
        BadgeComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DimensionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
