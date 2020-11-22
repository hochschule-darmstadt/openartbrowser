import { TestBed } from '@angular/core/testing';

import { IconclassService } from './iconclass.service';

describe('IconclassService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IconclassService = TestBed.get(IconclassService);
    expect(service).toBeTruthy();
  });
});
