import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntitiesComponent } from './entities.component';
import {InfiniteScrollComponent} from '../../shared/components/infinite-scroll/infinite-scroll.component';
import {DataService} from '../../core/services/elasticsearch/data.service';
import {HttpClientModule} from '@angular/common/http';
import {RouterModule} from '@angular/router';

describe('EntitiesComponent', () => {
  let component: EntitiesComponent;
  let fixture: ComponentFixture<EntitiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, RouterModule.forRoot([])],
      declarations: [
        EntitiesComponent,
        InfiniteScrollComponent
      ],
      providers: [
        DataService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
