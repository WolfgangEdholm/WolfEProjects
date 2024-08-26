import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WCompModalComponent } from './wcomp-modal.component';

describe('WCompModalComponent', () => {
  let component: WCompModalComponent;
  let fixture: ComponentFixture<WCompModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WCompModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WCompModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
