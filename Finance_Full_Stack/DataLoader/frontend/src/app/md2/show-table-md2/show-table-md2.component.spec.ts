import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowTableMd2Component } from './show-table-md2.component';

describe('ShowTableMd2Component', () => {
  let component: ShowTableMd2Component;
  let fixture: ComponentFixture<ShowTableMd2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShowTableMd2Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowTableMd2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
