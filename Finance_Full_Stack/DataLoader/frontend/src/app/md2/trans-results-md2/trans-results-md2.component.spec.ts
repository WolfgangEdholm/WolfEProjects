import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransResultsMd2Component } from './trans-results-md2.component';

describe('TransResultsMd2Component', () => {
  let component: TransResultsMd2Component;
  let fixture: ComponentFixture<TransResultsMd2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransResultsMd2Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransResultsMd2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
