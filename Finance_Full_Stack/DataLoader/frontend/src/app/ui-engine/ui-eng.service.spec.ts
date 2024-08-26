import { TestBed } from '@angular/core/testing';

import { UIEng } from './ui-eng.service';

describe('DataEngService', () => {
  let service: UIEng;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UIEng);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
