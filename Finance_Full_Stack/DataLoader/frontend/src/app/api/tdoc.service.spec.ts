import { TestBed } from '@angular/core/testing';

import { TDocService } from './tdoc.service';

describe('TDocService', () => {
  let service: TDocService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TDocService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
