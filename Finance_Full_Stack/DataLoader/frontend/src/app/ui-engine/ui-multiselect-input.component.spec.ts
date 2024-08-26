import { EventEmitter } from '@angular/core';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { UIMultiSelectInputComponent } from './ui-multiselect-input.component';


describe('UIMultiSelectInputComponent', () => {
  let component: UIMultiSelectInputComponent;
  let fixture: ComponentFixture<UIMultiSelectInputComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
          declarations: [UIMultiSelectInputComponent]
        })
        .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UIMultiSelectInputComponent);
    component = fixture.componentInstance;
    component.setValues = new EventEmitter<string[]>();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
