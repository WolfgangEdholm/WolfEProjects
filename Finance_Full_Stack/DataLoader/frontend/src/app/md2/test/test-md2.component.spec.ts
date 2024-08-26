import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestMd2Component } from './test-md2.component';

describe('TestMd2Component', () => {
  let component: TestMd2Component;
  let fixture: ComponentFixture<TestMd2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestMd2Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestMd2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
