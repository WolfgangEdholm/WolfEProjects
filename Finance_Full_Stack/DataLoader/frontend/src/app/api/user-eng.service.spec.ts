import { TestBed } from '@angular/core/testing';

import { UserEng } from './user-eng.service';

describe('UserEng', () => {
  let service: UserEng;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserEng);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
