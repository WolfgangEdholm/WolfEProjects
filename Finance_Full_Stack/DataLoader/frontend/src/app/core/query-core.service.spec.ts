import { TestBed } from '@angular/core/testing';

import { QueryCoreService } from './query-core.service';

describe('QueryCoreService', () => {
  let service: QueryCoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QueryCoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
