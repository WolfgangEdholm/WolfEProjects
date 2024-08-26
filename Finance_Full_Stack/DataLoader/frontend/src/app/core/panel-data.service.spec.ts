import { TestBed } from '@angular/core/testing';

import { PanelDataService } from './panel-data.service';

describe('PanelDataService', () => {
  let service: PanelDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PanelDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
