import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MotifComponent } from './motif.component';
import { SlideComponent } from 'src/app/shared/components/carousel/slide/slide.component';
import { CarouselComponent } from 'src/app/shared/components/carousel/carousel.component';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataService } from 'src/app/core/services/elasticsearch/data.service';
import { AbstractComponent } from 'src/app/shared/components/abstract/abstract.component';
import { TitleComponent } from 'src/app/shared/components/title/title.component';
import { InformationComponent } from 'src/app/shared/components/information/information.component';
import { BadgeComponent } from 'src/app/shared/components/badge/badge.component';

describe('MotifComponent', () => {
  let component: MotifComponent;
  let fixture: ComponentFixture<MotifComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgbModule, HttpClientModule, RouterModule.forRoot([])],
      declarations: [MotifComponent, SlideComponent, CarouselComponent, AbstractComponent, BadgeComponent, TitleComponent, InformationComponent],
      providers: [DataService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MotifComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
