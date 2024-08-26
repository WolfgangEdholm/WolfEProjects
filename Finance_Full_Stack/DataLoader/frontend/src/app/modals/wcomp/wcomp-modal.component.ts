import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as Modal from '../../services/modal.service';
import { MatSelectChange } from '@angular/material/select';
import { DataEngService } from '../../api/data-eng.service';
import { ComputeService } from '../../code/compute.service';
import { CodeUnit } from '../../types/compute';
import { Value, ValueType, valueToDbgStr } from 'src/app/types/compute';
import { Just } from 'src/app/types/compute';
import { AggSibling } from 'src/app/types/query';

export interface WCompModalSpec {
  name: string;
  codeUnit: CodeUnit;
  columns: string[];
  isNewColumn: boolean;
  dbType: string;
  ix: number;
}

// 45678911234567892123456789312345678941234567895123456789612345678971234567898
const operators = [
  { val: '=',  view: '= \u2002: Equal. a = b is true if a is equal to b' },
  { val: '<>', view: '<> : Not Equal. a <> b is true if a is not equal to b' },
  { val: '>' , view: '> \u2002: Greater Than. ' +
    'a > b is true if a is bigger than b' },
  { val: '>=', view: '>= : Greater Than or Equal. ' +
    'a >= b is true if a is bigger than or equal to b' },
  { val: '<',  view: '< \u2002: Less Than. ' +
    'a < b is true if a is smaller than b' },
  { val: '<=', view: '<= : Less Than or Equal. ' +
    'a <= b is true if a is smaller than or equal to b' },
  { val: '+',  view: '+ \u2002: Arithmetic addition, plus' },
  { val: '-',  view: '- \u2002: Arithmetic subtraction, minus' },
  { val: '*',  view: '* \u2002: Arithmetic multiplication, times' },
  { val: '/',  view: '/ \u2002: Arithmetic division, divided by' },
  { val: '^',  view: '^ \u2002: Power. a ^ 3  is a * a * a. ' +
    'a ^ .5 is square root of a' },
];

const functions = [
  { val: 'if(condition, if-true, if-false)', view:
    'if(condition, if-true, if-false) returns the if-true expression ' +
      'if condition is true and if-false otherwise' },
  { val: 'and(a, b, ...)', view:
    'and(a, b, ...) return true only of all parameters are true' },
  { val: 'not(a)', view:
    'not(a) inverts a, turns true into false anc vice versa' },
  { val: 'or(a, b, ...)', view:
    'or(a, b, ...) returns true if any of the parameters is true' },
  { val: 'mod(a, b)', view:
    'mod(a, b) returns a modulo b, the remainder of a divided by b' },
  { val: 'quotient(a, b)', view:
    'quotient(a, b) returns ingeger division of a / b. Complements mod(a, b)' },
  { val: 'round(a, b)', view:
  'round(a, b) rounds a to b digits. b = 2: .01, b = 0: 1, b = -2: 100' },
  { val: 'ceiling(a, b)', view:
    'ceiling(a, b) rounds up to nearest bultiple of b' },
  { val: 'floor(a, b)', view:
    'floor(a, b) rounds down to nearest bultiple of b' },
  { val: 'code(text)', view:
    'code(text) returns the character code for the first charater in text' },
  { val: 'char(number)', view:
    'char(number) returns the charater specified by the given code' },
  { val: 'len(text)', view:
    'len(text) returns the number of characters in text' },
  { val: 'text(number, formatText)', view:
    'text(number, formatText) formats number using $#,##0.00 like formats' },
  { val: 'lower(text)', view:
    'lower(text) converts text to lower case characters' },
  { val: 'upper(text)', view:
    'upper(text) converts text to upper case characters' },
  { val: 'concat(a, b, ...)', view:
    'concat(a, b, ...) concatenates the given text strings' },
  { val: 'left(text,[num_chars])', view: 'left(text,[num_chars]) ' +
    'returns the beginning of text. 1 char if no num_char' },
  { val: 'mid(text,start_num, num_chars)', view:
    'mid(text,start_num, num_chars) returns text starting at start_num' },
  { val: 'right(text,[num_chars])', view:
    'right(text,[num_chars]) returns the end of text. 1 char if no num_char' },
];

const justifications = [
  { val: Just.default,  view: 'Default' },
  { val: Just.left,  view: 'Left' },
  { val: Just.center,  view: 'Center' },
  { val: Just.right,  view: 'Right' },
];

const dbTypes = [
  'default',
  'int',
  'double',
  'boolean',
  'date',
  'datetime',
  'varchar(10)',
  'varchar(20)',
  'varchar(40)',
  'varchar(80)',
  'varchar(120)',
  'varchar(255)',
];

@Component({
  selector: 'app-wcomp-modal',
  templateUrl: './wcomp-modal.component.html',
  styleUrls: ['./wcomp-modal.component.scss'],
  // Encapsulation None for changing size of MatSelect dropdown
  encapsulation: ViewEncapsulation.None,
})
export class WCompModalComponent implements OnInit {
  @ViewChild('textarea', {static: false}) textarea: ElementRef;
  form: FormGroup;
  operators = operators;
  functions = functions;
  columns: string[];

  justifications = justifications;

  dbTypes = dbTypes;

  oldCode: string;

  okClickCount = 0;

  nameError = '';
  codeError = '';
  result = '';

  isShiftDown: boolean;
  isAltDown: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private modalRef: MatDialogRef<WCompModalSpec>,
    private modal: Modal.ModalService,
    @Inject(MAT_DIALOG_DATA) public data: WCompModalSpec,
    public dataEng: DataEngService,
    public computeEng: ComputeService,
  ) {
    this.columns = data.columns;
  }

  ngOnInit(): void {
    const code = this.data.isNewColumn ? '' : this.data.codeUnit.source;
    const computedDef = this.dataEng.compColumnDefs[this.data.ix];
    this.form = this.formBuilder.group({
      name: [this.data.name, []],
      code: [code, []],
      funcSelect: [undefined, []],
      opSelect: [undefined, []],
      colSelect: [undefined, []],
      justSelect: [computedDef.just, []],
      dbTypeSelect: [computedDef.dbType, []],
      groupByCompatible: [computedDef.aggSibling !== AggSibling.inactive, []],
      downstramChange: [false, []],
    });
    // console.log('COMPUTED_INIT dbTypeSelect', computedDef);
  }

  public deleteClick(event: MouseEvent): void {
    this.isShiftDown = event.shiftKey;
    this.isAltDown = ( event as PointerEvent ).altKey;
    const cols = this.dataEng.checkForDependencies(this.data.ix);
    if (cols.length > 0) {
      let colStr = '';
      for (let i = 0; i < cols.length; i++) {
        if (i === cols.length - 1) {
          if (i > 0) {
            colStr += ' and ';
          }
        } else if (i > 0) {
          colStr += ', ';
        }
        colStr += this.dataEng.compColumnDefs[cols[i]].displayName;
      }
      const name = this.dataEng.compColumnDefs[this.data.ix].displayName;
      let message = 'Column';
      message += cols.length > 1 ? `s ${colStr} are` : ` ${colStr} is`;
      message += ` dependent on ${name}`;
      this.modal.alert({
        title: 'Cannot remove computed column',
        message,
        okButton: 'OK',
      }).then(resp => {
        this.closeModal(Modal.ReturnCode.cancel);
      });
    } else {
      this.closeModal(Modal.ReturnCode.other);
    }
  }

  public cancelClick(event: MouseEvent): void {
    this.isShiftDown = event.shiftKey;
    this.isAltDown = ( event as PointerEvent ).altKey;
    const cu = this.dataEng.compColumnDefs[this.data.ix].codeUnit;
    if (this.data.isNewColumn) {
      // cancel coputed creation
      const computedIx = this.dataEng.compColumnDefs.length - 1;
      this.dataEng.removeComputedColumn(computedIx);
    } else {
      cu.source = this.oldCode;
    }
    this.closeModal(Modal.ReturnCode.cancel);
  }

  public okClick(event: MouseEvent): void {
    this.isShiftDown = event.shiftKey;
    this.isAltDown = ( event as PointerEvent ).altKey;
    const tp = this.compileCode();
    if (tp === ValueType.error && this.okClickCount === 0) {
      // this is logic that allows a user to save code that doesn't
      // compile to return and fix later
      this.okClickCount = 1;
      return;
    }
    const name = this.form.value.name;
    if (this.data.ix < 0 || name !== this.data.name) {
      for (const takenName of this.data.columns) {
        if (takenName === name) {
          this.nameError = 'Name is already taken';
          return;
        }
      }
    }
    const cColDef = this.dataEng.compColumnDefs[this.data.ix];
    const cu = cColDef.codeUnit;
    cColDef.displayName = name;
    cColDef.type = cu.type;
    cColDef.just = this.form.value.justSelect;
    cu.isReady = true;
    this.dataEng.updateComputedColumn(cu.ix);

    if (this.form.value.groupByCompatible) {
      if (cColDef.aggSibling === AggSibling.inactive) {
        cColDef.aggSibling = AggSibling.active;
        // if (this.dataEng.hasGroupBy()) {
        //  this.dataEng.addComputedAggSibling(cColDef);
        // }
      }
    } else {
      // if (cColDef.aggSibling > AggSibling.active) {
      //   this.dataEng.removeComputedAggSibling(cColDef);
      // }
      cColDef.aggSibling = AggSibling.inactive;
    }


    this.closeModal(Modal.ReturnCode.ok);
  }

  public compileCode(): ValueType {
    // console.log('DIALOG COMPILE', this.data.ix);
    const cu = this.dataEng.compColumnDefs[this.data.ix].codeUnit;
    this.oldCode = cu.source;
    cu.source = this.form.value.code;
    const okTp = this.computeEng.compileCode(cu, this.parseErrorDisplayFunc);
    if (okTp !== ValueType.error) {
      this.dataEng.calculateComputed();
    }
    return okTp;
  }

  public test(): void {
    const cu = this.dataEng.compColumnDefs[this.data.ix].codeUnit;
    const tp = this.compileCode();
    console.log('After test tp', tp);
    if (tp === ValueType.error) {
      this.result = 'ERROR';
      return;
    }
    const value = { type: ValueType.undef, val: 0 } as Value;
    const rowNm = cu.reversePass ? this.dataEng.dataRows.length - 1 : 0;
    this.computeEng.execute(cu, rowNm, value);
    if (value.type === ValueType.error) {
      this.result = 'ERROR';
    } else {
      if (value.type !== ValueType.undef) {
        const val = valueToDbgStr(value);
        this.result = `Compile successful. Value for row 1: ${val}`;
      }
      this.codeError = '';
    }
  }

  public funcSelectionChange(event: MatSelectChange): void {
    this.insertIntoCode('funcSelect', event.value);
  }

  public opSelectionChange(event: MatSelectChange): void {
    this.insertIntoCode('opSelect', event.value);
  }

  public colSelectionChange(event: MatSelectChange): void {
    this.insertIntoCode('colSelect', event.value, 'column("', '")');
  }

  public justSelectionChange(event: MatSelectChange): void {
    console.log('JUSTIFICATION =', event.value);
  }

  public dbTypeSelectionChange(event: MatSelectChange): void {
    console.log('DBTYPE =', event.value);
  }

  // Private methods

  private closeModal(cd: Modal.ReturnCode): void {
    const modalReturn = {
      code: cd,
      isShiftDown: this.isShiftDown,
      isAltDown: this.isAltDown,
      values: cd === Modal.ReturnCode.ok ? this.form.value : null
    } as Modal.Return;
    this.modalRef.close(modalReturn);
  }

  private insertIntoCode(
    selectName: string,
    newText: string,
    startWrapper?: string,
    endWrapper?: string,
  ): void {
    const wrapStart = startWrapper ? startWrapper : '';
    const wrapEnd = endWrapper ? endWrapper : '';
    const el = this.textarea.nativeElement;
    const selStart = el.selectionStart;
    const selEnd = el.selectionEnd;
    const text = el.value;
    const fillStart = (selStart > 0 && text[selStart] !== ' '
      && text[selStart] !== '(') ? '' : '';
    const fillEnd = text[selEnd] !== ' ' ? '' : '';
    const insText = fillStart + wrapStart + newText + wrapEnd + fillEnd;
    const before = text.substr(0, selStart);
    const after = text.substr(selEnd);
    el.value = before + insText + after;
    this.form.patchValue({[selectName]: undefined});

    el.selectionStart = el.selectionEdn = selStart + insText.length;
    setTimeout(() => el.focus(), 0);
    // The below code makes the form recognize that the input has been added
    const event = new Event('input', { bubbles: true });
    el.dispatchEvent(event);
  }

  private parseErrorDisplayFunc =
    (errMsg: string, parseStr: string, parsePos: number): void => {
    this.codeError = `${parseStr.substr(0, parsePos)}<-- ${errMsg}`;
  };

}
