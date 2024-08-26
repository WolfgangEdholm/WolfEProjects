import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WDataModalComponent } from './wdata-modal.component';

describe('WCompModalComponent', () => {
  let component: WDataModalComponent;
  let fixture: ComponentFixture<WDataModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WDataModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WDataModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
