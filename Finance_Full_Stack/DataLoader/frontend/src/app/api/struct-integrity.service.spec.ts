import { TestBed } from '@angular/core/testing';

import { StructIntegrityService } from './struct-integrity.service';

describe('StructIntegrityService', () => {
  let service: StructIntegrityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StructIntegrityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
