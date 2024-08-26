import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SvModalComponent } from './sv-modal.component';

describe('ConstrDialogComponent', () => {
  let component: SvModalComponent;
  let fixture: ComponentFixture<SvModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SvModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SvModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
