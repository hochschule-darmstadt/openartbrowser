import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {StickyTitleComponent} from './sticky-title.component';
import {RouterModule} from "@angular/router";

describe('StickyTitleComponent', () => {
  let component: StickyTitleComponent;
  let fixture: ComponentFixture<StickyTitleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([], { relativeLinkResolution: 'legacy' })],
      declarations: [StickyTitleComponent]
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
