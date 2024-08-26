import { TestBed } from '@angular/core/testing';

import { QDocService } from './qdoc.service';

describe('QDocService', () => {
  let service: QDocService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QDocService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
