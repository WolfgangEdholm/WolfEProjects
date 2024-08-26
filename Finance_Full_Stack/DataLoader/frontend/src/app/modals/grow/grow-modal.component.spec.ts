import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GrowModalComponent } from './grow-modal.component';

describe('SaveModalComponent', () => {
  let component: GrowModalComponent;
  let fixture: ComponentFixture<GrowModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GrowModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GrowModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
