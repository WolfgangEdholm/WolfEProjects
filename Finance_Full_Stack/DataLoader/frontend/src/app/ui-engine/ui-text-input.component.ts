import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UIEng } from './ui-eng.service';
import { CssService } from './ui-css.service';
import { MatFormFieldAppearance } from '@angular/material/form-field';

@Component({
  selector: 'app-text-input',
  templateUrl: './ui-text-input.component.html',
  styleUrls: ['./ui-text-input.component.scss']
})
export class UITextInputComponent implements OnInit {

  @Input() public fieldName: string;
  @Input() public title: string;
  @Input() public look = 'legacy' as MatFormFieldAppearance;

  @Output() public valueChange: EventEmitter<[string, string]> =
      new EventEmitter();

  public initValue: string;
  public type = 'text';
  // public currentValue: string;

  private formIx: number;

  constructor(
    public uie: UIEng,
    public css: CssService,
  ) { }

  ngOnInit(): void {
    // this.initValue = this.uie.form.controls[this.fieldName].value;
    // this.currentValue = this.initValue;
  }

  onValueChange(event: any): void {
    this.valueChange.emit([this.fieldName, event]);
  }

  hasError(): boolean {
    return this.uie.hasError(this.fieldName);
  }
}
