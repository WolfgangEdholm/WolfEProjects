import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as Modal from '../../services/modal.service';
import { MatSelectChange } from '@angular/material/select';
import { MatFormFieldDefaultOptions, MAT_FORM_FIELD_DEFAULT_OPTIONS
} from '@angular/material/form-field';
import { DataIntegrityService } from '../../api/data-integrity.service';
import { QDoc } from '../../types/query';
import { Database } from '../../types/db';
import { ContextService } from '../../core/context.service';

// 45678911234567892123456789312345678941234567895123456789612345678971234567898

export type GrowModalSpec = {
};

export type GrowModaFormElements = {
};

const appearance: MatFormFieldDefaultOptions = {
  // appearance: 'legacy'
  appearance: 'standard'
  // appearance: 'fill'
  // appearance: 'outline'
};

@Component({
  selector: 'app-grow-modal',
  templateUrl: './grow-modal.component.html',
  styleUrls: ['./grow-modal.component.scss'],
  // Encapsulation None for changing size of MatSelect dropdown
  encapsulation: ViewEncapsulation.None,
  providers: [{
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: appearance
    }],
})
export class GrowModalComponent implements OnInit {
  isShiftDown: boolean;
  isAltDown: boolean;
  form: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private modal: Modal.ModalService,
    private modalRef: MatDialogRef<GrowModalSpec>,
    @Inject(MAT_DIALOG_DATA) public data: GrowModalSpec,
    public g: ContextService,
  ) {
  }

  public ngOnInit(): void {
    console.log('GROW MODAL', this.data);

    this.form = this.formBuilder.group({
    } as GrowModaFormElements);
  }


  public closeModal(cd: Modal.ReturnCode = 0): void {
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


}
