import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonsInfoComponent } from './commons-info-component';

describe('CommonsInfoComponent', () => {
  let component: CommonsInfoComponent;
  let fixture: ComponentFixture<CommonsInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonsInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommonsInfoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
