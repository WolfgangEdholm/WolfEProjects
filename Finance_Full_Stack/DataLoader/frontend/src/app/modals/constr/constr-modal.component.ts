import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as Modal from '../../services/modal.service';
import { MatSelectChange } from '@angular/material/select';
import { DataEngService } from '../../api/data-eng.service';
import { ComputeService } from '../../code/compute.service';
import { CompareOp } from '../../types/compute';

export interface ConstrModalSpec {
  tableName: string;
  tableIx: number;
  columnName: string;
  columnIx: number;
  compareOpStr: string;
  compareOp: CompareOp;
  valuesStr: string;
}

// 45678911234567892123456789312345678941234567895123456789612345678971234567898
const operators = [
  { val: '=',  view: '= \u2002: Equal. Row is selected if the row ' +
    'value is equal to the specified value' },
  { val: '<>', view: '<> : Not Equal. Row is selected if the row ' +
    'value is not equal to the specified value' },
  { val: '>' , view: '> \u2002: Greater Than. Row is selected if the row ' +
    'value is greater than to the specified value' },
  { val: '>=', view: '>= : Greater Than or Equal. Row is selected if the row ' +
    'value is greater than to the specified value' },
  { val: '<',  view: '< \u2002: Less Than. Row is selected if the row ' +
    'value is less than to the specified value' },
  { val: '<=', view: '<= : Less Than or Equal. Row is selected if the row ' +
    'value is less than or equal to the specified value' },
  { val: 'in', view: 'In\u2002: Row is selected if the row ' +
    'value exists in the list of specified values' },
];

@Component({
  selector: 'app-computed-modal',
  templateUrl: './constr-modal.component.html',
  styleUrls: ['./constr-modal.component.scss'],
  // Encapsulation None for changing size of MatSelect dropdown
  encapsulation: ViewEncapsulation.None,
})
export class ConstrModalComponent implements OnInit {
  @ViewChild('textarea', {static: false}) textarea: ElementRef;
  form: FormGroup;
  operators = operators;
  allValues: string[];
  tempValues: string[];

  isMultiple: boolean;

  isShiftDown: boolean;
  isAltDown: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private modalRef: MatDialogRef<ConstrModalSpec>,
    @Inject(MAT_DIALOG_DATA) public data: ConstrModalSpec,
    public dataEng: DataEngService,
    public computeEng: ComputeService,
  ) {
    this.getValues();
  }

  ngOnInit(): void {
    this.isMultiple = this.data.compareOpStr === 'in';
    const hasValues = !!this.data.valuesStr;
    this.form = this.formBuilder.group({
      opSelect: [this.data.compareOpStr, []],
      values: [this.data.valuesStr, []],
      oneValueSelect: [hasValues ? 'test' : undefined, []],
      manyValuesSelect: [hasValues ? this.matchValues() : [undefined], []],
    });
  }

  public closeModal(cd: number = 0): void {
    // console.log('CLOSEDIALOG FUNC CODE', cd);
    const dialogReturn = {
      code: cd,
      isShiftDown: this.isShiftDown,
      isAltDown: this.isAltDown,
      values: cd === Modal.ReturnCode.ok ? this.form.value : null
    } as Modal.Return;
    this.modalRef.close(dialogReturn);
  }

  public deleteClick(event: MouseEvent): void {
    this.isShiftDown = event.shiftKey;
    this.isAltDown = ( event as PointerEvent ).altKey;
    this.closeModal(Modal.ReturnCode.other);
  }

  public cancelClick(event: MouseEvent): void {
    this.isShiftDown = event.shiftKey;
    this.isAltDown = ( event as PointerEvent ).altKey;
    this.closeModal(Modal.ReturnCode.cancel);
  }

  public okClick(event: MouseEvent): void {
    this.isShiftDown = event.shiftKey;
    this.isAltDown = ( event as PointerEvent ).altKey;
    this.closeModal(Modal.ReturnCode.ok);
  }

  public opSelectionChange(event: MatSelectChange): void {
    this.isMultiple = event.value === 'in';
  }

  public valueSelectionChange(event: MatSelectChange): void {
    if (this.isMultiple) {
      this.tempValues = event.value;
    } else {
      this.insertIntoValues('valuesSelect', event.value, false);
    }
  }

  public openedChange(opened: boolean): void {
    if (!opened) {
      this.insertIntoValues('valuesSelect', this.tempValues, true);
    }
  }

  // Private methods

  private getValues = async (): Promise<void> => {
    this.dataEng.getList(this.data.tableIx, this.data.columnIx).then(() => {
      const columnName = this.data.columnName;
      this.allValues = [];
      for (const row of this.dataEng.listRows) {
        this.allValues.push(row[columnName]);
      }
      console.log('GETVALUES', this.allValues);
    });
  };

  private matchValues(): string[] {
    const specArr = this.data.valuesStr.split(',');
    const sa = specArr.map(item => item.trim());
    for (const s of sa) {
      console.log(`>${s}<`);
    }
    return sa;
  }

  private insertIntoValues(
    selectName: string,
    newText: any,
    multipleValues: boolean,
  ): void {
    const el = this.textarea.nativeElement;

    if (multipleValues) {
      if (newText) {
        let text = '';
        for (let i = 0; i < newText.length; i++) {
          if (i > 0) {
            text += ', ';
          }
          text += newText[i];
        }
        el.value = text;
      }
      this.form.patchValue({[selectName]: undefined});
    } else {
      el.value = newText;
    }

    setTimeout(() => el.focus(), 0);
    // The below code makes the form recognize that the input has been added
    const event = new Event('input', { bubbles: true });
    el.dispatchEvent(event);
  }
}
