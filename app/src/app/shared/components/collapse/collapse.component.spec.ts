import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollapseComponent } from './collapse.component';
import {Angulartics2RouterlessModule} from 'angulartics2/routerlessmodule';

describe('CollapseComponent', () => {
  let component: CollapseComponent;
  let fixture: ComponentFixture<CollapseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CollapseComponent ],
      imports: [Angulartics2RouterlessModule.forRoot()]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollapseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
