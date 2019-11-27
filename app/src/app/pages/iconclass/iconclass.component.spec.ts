import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IconclassComponent } from './iconclass.component';
import { SlideComponent } from 'src/app/shared/components/slider/slide/slide.component';
import { SliderComponent } from 'src/app/shared/components/slider/slider.component';
import { DataService } from 'src/app/core/services/data.service';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

describe('IconclassComponent', () => {
  let component: IconclassComponent;
  let fixture: ComponentFixture<IconclassComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule,
        HttpClientModule,
        RouterModule.forRoot([])
      ],
      declarations: [
        IconclassComponent,
        SlideComponent,
        SliderComponent,
      ],
      providers: [
        DataService,
      ]
    }).compileComponents();
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
