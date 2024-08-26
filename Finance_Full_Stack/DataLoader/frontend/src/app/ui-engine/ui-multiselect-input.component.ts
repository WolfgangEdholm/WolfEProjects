import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UIEng } from './ui-eng.service';
import { CssService } from './ui-css.service';

@Component({
  selector: 'app-multi-select-input',
  templateUrl: './ui-multiselect-input.component.html',
  styleUrls: ['./ui-multiselect-input.component.scss']
})
export class UIMultiSelectInputComponent implements OnInit {

  @Input() public fieldName: string;
  @Input() public title: string;
  @Input() public selectList: string[];

  @Output() public valueChange: EventEmitter<[string, string[]]> =
      new EventEmitter();

  public currentlySelected: string[] = [];
  public setValues: EventEmitter<string[]>;

  constructor(
    public uie: UIEng,
    public css: CssService,
  ) { }

  ngOnInit(): void {
    this.currentlySelected = this.uie.forms[0].controls[this.fieldName].value;
  }

  onChangeSelection(selectedString: string, event: any): void {
    if (!event.isUserInput) {
      return;
    }
    if (event.source.selected) {
      this.valueChange.emit(
          [this.fieldName, [...this.currentlySelected, selectedString]]);
    } else {
      this.valueChange.emit([this.fieldName,
        this.currentlySelected.filter(val => val !== selectedString)]);
    }
  }

  hasError(): boolean {
    return this.uie.hasError(this.fieldName);
  }
}
