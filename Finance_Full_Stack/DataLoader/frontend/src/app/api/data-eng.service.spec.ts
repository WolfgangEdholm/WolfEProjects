import { TestBed } from '@angular/core/testing';

import { DataEngService } from './data-eng.service';

describe('DataEngService', () => {
  let service: DataEngService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataEngService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
