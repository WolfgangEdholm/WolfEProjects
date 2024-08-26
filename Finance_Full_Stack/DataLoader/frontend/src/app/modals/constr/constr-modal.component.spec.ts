import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConstrModalComponent } from './constr-modal.component';

describe('ConstrModalComponent', () => {
  let component: ConstrModalComponent;
  let fixture: ComponentFixture<ConstrModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConstrModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConstrModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
