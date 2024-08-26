import { TestBed } from '@angular/core/testing';

import { TransSourceInService } from './ts-in.service';

describe('TransSourceInService', () => {
  let service: TransSourceInService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransSourceInService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
