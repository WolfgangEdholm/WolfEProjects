import { TestBed } from '@angular/core/testing';

import { TransSourceOutService } from './ts-out.service';

describe('TransSourceOutService', () => {
  let service: TransSourceOutService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransSourceOutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
