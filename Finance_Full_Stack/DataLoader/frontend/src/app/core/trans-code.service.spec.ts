import { TestBed } from '@angular/core/testing';

import { TransCoreService } from './trans-core.service';

describe('TransCoreService', () => {
  let service: TransCoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransCoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
