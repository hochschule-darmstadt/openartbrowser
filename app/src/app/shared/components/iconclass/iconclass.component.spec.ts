import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IconclassComponent } from './iconclass.component';
import { DataService } from 'src/app/core/services/elasticsearch/data.service';

describe('IconclassComponent', () => {
  let component: IconclassComponent;
  let fixture: ComponentFixture<IconclassComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IconclassComponent ],
      providers: [ DataService]
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
