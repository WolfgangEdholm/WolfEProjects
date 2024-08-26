import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as Modal from '../../services/modal.service';
import { MatSelectChange } from '@angular/material/select';
import { DataEngService, DataColumnDef, Integrity,
} from '../../api/data-eng.service';
import { QueryCoreService } from '../../core/query-core.service';
import { QDocService } from '../../api/qdoc.service';
import { QueryService } from '../../cmd/query.service';
import { Just, ValueType } from 'src/app/types/compute';
import * as XDate from '../../utils/date';
import { AggSibling } from 'src/app/types/query';

export interface WDataModalSpec {
  ix: number;
}

// 45678911234567892123456789312345678941234567895123456789612345678971234567898

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
  selector: 'app-wdata-modal',
  templateUrl: './wdata-modal.component.html',
  styleUrls: ['./wdata-modal.component.scss'],
  // Encapsulation None for changing size of MatSelect dropdown
  encapsulation: ViewEncapsulation.None,
})
export class WDataModalComponent implements OnInit {
  @ViewChild('textarea', {static: false}) textarea: ElementRef;
  form: FormGroup;

  dColDef: DataColumnDef;
  // extraTypeIx = -1;
  columnName: string;
  columns: string[];

  justifications = justifications;

  dbTypes = dbTypes;

  dependents: string[] = [];

  nameError = '';

  isShiftDown: boolean;
  isAltDown: boolean;

  advancedIsOpen = false;

  isNumeric = false;


  constructor(
    private formBuilder: FormBuilder,
    private modalRef: MatDialogRef<WDataModalSpec>,
    private modal: Modal.ModalService,
    @Inject(MAT_DIALOG_DATA) public data: WDataModalSpec,
    public dataEng: DataEngService,
    public qc: QueryCoreService,
    public qdoc: QDocService,
    public qs: QueryService,
  ) {
    // this.columns = data.columns;
  }

  ngOnInit(): void {
    const de = this.dataEng;
    this.dColDef = de.dataColumnDefs[this.data.ix];
    const originalTypeIx = dbTypes.findIndex(e => e === this.dColDef.dbType);
    if (originalTypeIx === -1) {
      // this.extraTypeIx = dbTypes.length;
      this.dbTypes.push(this.dColDef.dbType);
    }

    this.isNumeric = this.dColDef.type === ValueType.num;
    this.columnName = this.dColDef.displayName;
    this.columns = de.getFixedNameArr().filter(c => c !== this.columnName);
    // this.columns = de.fixedColumns.filter(c => c !== this.columnName);
    this.form = this.formBuilder.group({
      name: [this.columnName, []],
      justSelect: [this.dColDef.just, []],
      doNotOutput: [this.dColDef.doNotOutput, []],
      dbTypeSelect: [this.dColDef.dbType, []],
      groupByCompatible: [this.dColDef.aggSibling !== AggSibling.inactive, []],
      downstramChange: [false, []],
      dependentCols: ['', []],
      changeFixDate: [false, []],
    });
    const depCols = de.checkForDependencies(-this.data.ix - 1);
    if (depCols.length > 0) {
      depCols.forEach(e => {
        this.dependents.push(de.compColumnDefs[e].displayName);
      });
      this.dependents.sort((a, b) => a < b ? -1 : 1);
    }
    if (this.dColDef.integrityCode > Integrity.ok) {
      this.advancedIsOpen = true;
    }
    console.log('WDATA_INIT', this.dColDef);
  }

  public advancedClick(event: MouseEvent): void {
    this.advancedIsOpen = !this.advancedIsOpen;
  }

  public cancelClick(event: MouseEvent): void {
    this.isShiftDown = event.shiftKey;
    this.isAltDown = ( event as PointerEvent ).altKey;
    this.closeModal(Modal.ReturnCode.cancel);
  }

  public okClick(event: MouseEvent): void {
    this.isShiftDown = event.shiftKey;
    this.isAltDown = ( event as PointerEvent ).altKey;
    const name = this.form.value.name;
    if (this.data.ix < 0 || name !== this.columnName) {
      for (const takenName of this.columns) {
        if (takenName === name) {
          this.nameError = 'Name is already taken';
          return;
        }
      }
    }
    const rCol = this.qc.requestMgr.columnFromUuid(this.dColDef.uuid);
    this.dColDef.displayName = name;
    rCol.setName(name);
    this.dColDef.just = this.form.value.justSelect;
    this.dColDef.dbType = this.form.value.dbTypeSelect;
    if (this.isNumeric) {
      if (this.form.value.groupByCompatible) {
        if (this.dColDef.aggSibling === AggSibling.inactive) {
          this.dColDef.aggSibling = AggSibling.active;
          // if (this.dataEng.hasGroupBy()) {
          //   this.dataEng.addDataAggSibling(this.dColDef);
          // }
        }
      } else {
        // if (this.dColDef.aggSibling > AggSibling.active) {
        //   this.dataEng.removeDataAggSibling(this.dColDef);
        // }
        this.dColDef.aggSibling = AggSibling.inactive;
      }
    }
    this.dColDef.doNotOutput = this.form.value.doNotOutput;
    if (this.form.value.downstramChange) {
      this.dColDef.changeDate = XDate.nowString();
    }
    if (this.form.value.changeFixDate) {
      this.dColDef.fixDate = XDate.nowString();
      this.qs.updateQDocIntegrity(this.qc.currQuery, undefined);
    }
    this.closeModal(Modal.ReturnCode.ok);
  }

  public justSelectionChange(event: MatSelectChange): void {
    console.log('JUSTIFICATION =', event.value);
  }

  public dbTypeSelectionChange(event: MatSelectChange): void {
    console.log('DBTYPE =', event.value);
  }

  // public onFixedDateChange(event: any): void {
  //   console.log('DATEPICKER', event);
  // }

  public integrityCheck(): string {
    if (this.dColDef.integrityCode === 1) {
      return 'error-color';
    }
    return '';
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

}
