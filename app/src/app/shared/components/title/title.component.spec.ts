import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TitleComponent } from './title.component';
import { RouterModule } from '@angular/router';

describe('TitleComponent', () => {
  let component: TitleComponent;
  let fixture: ComponentFixture<TitleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([], { relativeLinkResolution: 'legacy' })],
      declarations: [TitleComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
