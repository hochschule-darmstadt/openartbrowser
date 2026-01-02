import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { IconclassComponent } from './iconclass.component';
import { DataService } from 'src/app/core/services/elasticsearch/data.service';
import { HttpClientModule } from '@angular/common/http';

describe('IconclassComponent', () => {
  let component: IconclassComponent;
  let fixture: ComponentFixture<IconclassComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      declarations: [IconclassComponent],
      providers: [DataService],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IconclassComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
