import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';


export interface PromptModalSpec {
  title: string;
  message: string;
  placeholder1: string;
  initial1: string;
  placeholder2: string;
  initial2: string;
  okButton: string;
  cancelButton: string;
  otherButton: string;
}

@Component({
  selector: 'app-prompt-modal',
  templateUrl: './prompt-modal.component.html',
  styleUrls: ['./prompt-modal.component.scss']
})
export class PromptModalComponent implements OnInit {
  form: FormGroup;
  isShiftDown: boolean;
  isAltDown: boolean;

  constructor(
    private formBuilder: FormBuilder,
    public modalRef: MatDialogRef<PromptModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PromptModalSpec,
  ) {
console.log('-------------- DATA', data);
   }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      input1: [this.data.placeholder1 ? this.data.initial1 : '', []],
      input2: [this.data.placeholder2 ? this.data.initial2 : '', []],
    });
  }

  public modalButtonClick(event: MouseEvent, cd: number = 0): void {
    // console.log('CLOSEDIALOG FUNC CODE', cd, 'SHIFTKEY', event.shiftKey,
    // ( event as PointerEvent ).altKey);
    this.isShiftDown = event.shiftKey;
    this.isAltDown = ( event as PointerEvent ).altKey;
    const dialogReturn = {
      code: cd,
      isShiftDown: this.isShiftDown,
      isAltDown: this.isAltDown,
      values: cd === 1 /* Modal.ReturnCode.ok */ ? this.form.value : null
    } /* Modal.Return */;
    this.modalRef.close(dialogReturn);
  }

}
