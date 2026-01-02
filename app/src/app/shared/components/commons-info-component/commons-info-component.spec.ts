import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { CommonsInfoComponent } from './commons-info-component';

describe('CommonsInfoComponent', () => {
  let component: CommonsInfoComponent;
  let fixture: ComponentFixture<CommonsInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, CommonsInfoComponent],
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
