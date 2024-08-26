import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as Modal from '../../services/modal.service';
import { MatSelectChange } from '@angular/material/select';
import { DataEngService } from '../../api/data-eng.service';
import { ComputeService } from '../../code/compute.service';
// import { CodeUnit } from '../../code/compute.service';
// import { Value, ValueType, valueToDbgStr } from 'src/app/types/compute';
// import { CompareOp } from '../../types/compute';
// import { CompileShallowModuleMetadata } from '@angular/compiler';
import { MatCheckboxChange } from '@angular/material/checkbox';


export interface QueryEditSpec {
  hasGroupBy: boolean;
  groupByColumns: string[];
  allVisibleColumns: string[];
  hiddenColumns: string[];
  allHideableColumns: string[];
}

@Component({
  selector: 'app-data-modal',
  templateUrl: './data-modal.component.html',
  styleUrls: ['./data-modal.component.scss'],
  // Encapsulation None for changing size of MatSelect dropdown
  encapsulation: ViewEncapsulation.None,
})
export class DataModalComponent implements OnInit {
  @ViewChild('textarea', {static: false}) textarea: ElementRef;
  form: FormGroup;
  hasGroupBy = false;
  isShiftDown: boolean;
  isAltDown: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private dialog: Modal.ModalService,
    private modalRef: MatDialogRef<QueryEditSpec>,
    @Inject(MAT_DIALOG_DATA) public data: QueryEditSpec,
    public dataEng: DataEngService,
    public computeEng: ComputeService,
  ) {
    this.hasGroupBy = this.dataEng.hasGroupBy();
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      hasGroupBy: [this.hasGroupBy, []],
      selectedColumns:
        [{ value: this.data.groupByColumns, disabled: !this.hasGroupBy }, []],
      hiddenColumns: [this.data.hiddenColumns, []],
    });
  }

  public closeModal(cd: number = 0): void {
    const dialogReturn = {
      code: cd,
      isShiftDown: this.isShiftDown,
      isAltDown: this.isAltDown,
      values: cd === Modal.ReturnCode.ok ? this.form.value : null
    } as Modal.Return;
    this.modalRef.close(dialogReturn);
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
    const hasGroupBy = this.form.value.hasGroupBy;
    if (hasGroupBy) {
      const columns = this.form.value.selectedColumns;
      this.dataEng.setGroupByFromArr(columns);
    } else {
      this.dataEng.clearGroupBy();
    }
    const de = this.dataEng;
    const hiddenColumns =  this.form.value.hiddenColumns;
    de.dataColumnDefs.forEach(dc => {
      dc.isVisible = hiddenColumns.find(
        (h: string) => h === dc.displayName) ? false : true;
    });
    de.compColumnDefs.forEach(cc => {
      if (!cc.isAggSibling) {
        cc.isVisible = hiddenColumns.find(
          (h: string) => h === cc.displayName) ? false : true;
      }
    });
    this.dataEng.workDisplayUpdate();
  }

  public columnSelectionChange(event: MatSelectChange): void {
  }

  public hiddenColumnSelectionChange(event: MatSelectChange): void {
  }

  groupbyChange(event: MatCheckboxChange): void {
    if (event.checked) {
      this.form.controls.selectedColumns.enable();
    } else {
      this.form.controls.selectedColumns.disable();
    }
  }

  // Private methods

}
