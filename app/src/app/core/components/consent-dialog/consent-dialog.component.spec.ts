import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsentDialogComponent } from './consent-dialog.component';
import {Angulartics2RouterlessModule} from 'angulartics2/routerlessmodule';

describe('ConsentDialogComponent', () => {
  let component: ConsentDialogComponent;
  let fixture: ComponentFixture<ConsentDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsentDialogComponent ],
      imports: [Angulartics2RouterlessModule.forRoot()]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
