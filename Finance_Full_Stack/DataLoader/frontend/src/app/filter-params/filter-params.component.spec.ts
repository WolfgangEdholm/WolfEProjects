import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterParamsComponent } from './filter-params.component';

describe('FilterParamsComponent', () => {
  let component: FilterParamsComponent;
  let fixture: ComponentFixture<FilterParamsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilterParamsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterParamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
