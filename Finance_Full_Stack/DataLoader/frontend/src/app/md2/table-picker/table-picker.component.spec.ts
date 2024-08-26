import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablePickerMd2Component } from './table-picker.component';

describe('TablePickerMd2Component', () => {
  let component: TablePickerMd2Component;
  let fixture: ComponentFixture<TablePickerMd2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TablePickerMd2Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TablePickerMd2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
