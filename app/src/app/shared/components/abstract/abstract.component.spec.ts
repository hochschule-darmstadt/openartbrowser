import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AbstractComponent } from './abstract.component';

describe('AbstractComponent', () => {
  let component: AbstractComponent;
  let fixture: ComponentFixture<AbstractComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AbstractComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AbstractComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
