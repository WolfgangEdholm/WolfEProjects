import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveMd2Component } from './save-md2.component';

describe('SaveMd2Component', () => {
  let component: SaveMd2Component;
  let fixture: ComponentFixture<SaveMd2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SaveMd2Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveMd2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
