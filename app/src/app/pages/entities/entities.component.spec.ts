import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntitiesComponent } from './entities.component';
import { DataService } from '../../core/services/elasticsearch/data.service';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FetchingListComponent } from '../../shared/components/fetching-list/fetching-list.component';

describe('EntitiesComponent', () => {
  let component: EntitiesComponent;
  let fixture: ComponentFixture<EntitiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, RouterModule.forRoot([])],
      declarations: [
        EntitiesComponent,
        FetchingListComponent
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
