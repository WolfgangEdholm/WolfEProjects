import { TestBed } from '@angular/core/testing';

import { TransEngService } from './trans-eng.service';

describe('TransEngService', () => {
  let service: TransEngService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransEngService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
