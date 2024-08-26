import { TestBed } from '@angular/core/testing';

import { SegmentEng } from './segment-eng.service';

describe('SegmentEngService', () => {
  let service: SegmentEng;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SegmentEng);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
