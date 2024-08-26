import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { UITextInputComponent } from './ui-text-input.component';
import { UIEngineModule } from './ui-engine.module';

describe('UITextInput', () => {
  let component: UITextInputComponent;
  let fixture: ComponentFixture<UITextInputComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
          declarations: [UITextInputComponent],
          imports: [
            UIEngineModule,
            NoopAnimationsModule,
          ]
        })
        .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UITextInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
