import { TestBed } from '@angular/core/testing';

import { DbEngService } from './db-eng.service';

describe('DbEngService', () => {
  let service: DbEngService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DbEngService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
