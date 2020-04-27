import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MovementOverviewComponent } from './movement-overview.component';

describe('MovementOverviewComponent', () => {
  let component: MovementOverviewComponent;
  let fixture: ComponentFixture<MovementOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MovementOverviewComponent ]
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
