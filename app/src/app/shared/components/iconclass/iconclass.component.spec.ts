import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {IconclassComponent} from './iconclass.component';
import {DataService} from 'src/app/core/services/elasticsearch/data.service';
import {HttpClientModule} from '@angular/common/http';

describe('IconclassComponent', () => {
  let component: IconclassComponent;
  let fixture: ComponentFixture<IconclassComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      declarations: [IconclassComponent],
      providers: [DataService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IconclassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
