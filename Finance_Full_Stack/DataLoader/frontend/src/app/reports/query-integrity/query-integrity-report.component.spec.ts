import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryIntegrityReportComponent
} from './query-integrity-report.component';

describe('QueryIntegrityReportComponent', () => {
  let component: QueryIntegrityReportComponent;
  let fixture: ComponentFixture<QueryIntegrityReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QueryIntegrityReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryIntegrityReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
