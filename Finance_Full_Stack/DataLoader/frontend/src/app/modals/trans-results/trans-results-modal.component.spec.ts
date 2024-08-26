import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransResultsModalComponent } from './trans-results-modal.component';

describe('SaveModalComponent', () => {
  let component: TransResultsModalComponent;
  let fixture: ComponentFixture<TransResultsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransResultsModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransResultsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
