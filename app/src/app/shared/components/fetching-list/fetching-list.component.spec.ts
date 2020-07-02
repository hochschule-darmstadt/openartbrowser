import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FetchingListComponent } from './fetching-list.component';

describe('FetchingListComponent', () => {
  let component: FetchingListComponent;
  let fixture: ComponentFixture<FetchingListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FetchingListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FetchingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
