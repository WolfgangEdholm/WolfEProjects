import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowTable2Md2Component } from './show-table2-md2.component';

describe('ShowTable2Md2Component', () => {
  let component: ShowTable2Md2Component;
  let fixture: ComponentFixture<ShowTable2Md2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShowTable2Md2Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowTable2Md2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
