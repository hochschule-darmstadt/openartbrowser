import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MovementComponent } from './movement.component';

describe('MovementComponent', () => {
  let component: MovementComponent;
  let fixture: ComponentFixture<MovementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MovementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MovementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
