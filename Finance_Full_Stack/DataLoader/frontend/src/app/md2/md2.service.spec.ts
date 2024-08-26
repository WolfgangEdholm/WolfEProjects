import { TestBed } from '@angular/core/testing';

import { Md2Service } from './md2.service';

describe('Md2Service', () => {
  let service: Md2Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Md2Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
