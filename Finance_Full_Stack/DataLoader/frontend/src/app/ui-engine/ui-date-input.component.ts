import { Component, EventEmitter, Input, OnChanges, OnInit, Output,
} from '@angular/core';
import { UIEng } from './ui-eng.service';
import { CssService } from './ui-css.service';

@Component({
  selector: 'app-date-input',
  templateUrl: './ui-date-input.component.html',
  styleUrls: ['./ui-date-input.component.scss']
})
export class UIDateInputComponent implements OnInit, OnChanges {

  @Input() public fieldName: string;
  @Input() public title: string;

  @Output() public valueChange: EventEmitter<[string, string]> =
      new EventEmitter();

  public initValue: Date;
  public currentValue: Date;

  constructor(
    public uie: UIEng,
    public css: CssService,
  ) { }

  ngOnInit(): void {
    // this.initValue = this.uie.form.controls[this.fieldName].value;
    // this.currentValue = this.initValue;
  }

  ngOnChanges(): void {
    this.currentValue = new Date(this.initValue);
  }

  onDateChange(event: any): void {
    this.currentValue = event.value;
    this.valueChange.emit([this.fieldName, event]);
  }

  hasError(): boolean {
    return this.uie.hasError(this.fieldName);
  }
}
