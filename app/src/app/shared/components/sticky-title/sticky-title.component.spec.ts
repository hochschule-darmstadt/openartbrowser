import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StickyTitleComponent } from './sticky-title.component';

describe('StickyTitleComponent', () => {
  let component: StickyTitleComponent;
  let fixture: ComponentFixture<StickyTitleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StickyTitleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StickyTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
