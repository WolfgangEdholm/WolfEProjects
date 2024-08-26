import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { UIDateInputComponent } from './ui-date-input.component';


describe('UIDateInput', () => {
  let component: UIDateInputComponent;
  let fixture: ComponentFixture<UIDateInputComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
          declarations: [UIDateInputComponent]
        })
        .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UIDateInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
