import { Injectable } from '@angular/core';

import { FormControl, FormGroup, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class UIEng {
  public forms: FormGroup[] = [];
  // public form: FormGroup;
  public errorMessage: string;

  constructor() { }

  public clearForms(): void {
    this.forms = [];
  }

  public currForm(): FormGroup {
    return this.forms[this.forms.length - 1];
  }

  public hasError(fieldName: string): boolean {
    const errors = this.forms[0].controls[fieldName].errors;
    if (!errors) {
      return false;
    }
    // console.log("ERROR =", errors);
    if ('required' in errors) {
      this.errorMessage = 'Field is required';
    } else if ('maxlength' in errors) {
      this.errorMessage = `Max ${errors.maxlength.requiredLength} chars`;
    } else if ('pattern' in errors) {
      this.errorMessage = 'Not a number';
    } else if ('email' in errors) {
      this.errorMessage = 'Bad email format';
    } else if ('matDatepickerParse' in errors) {
      this.errorMessage = 'Bad date format';
    } else {
      this.errorMessage = 'Error';
    }
    return true;
  }

  public touchForm(): void {
    for (const form of this.forms) {
      // Touch all elements to display validation messages
      // for (const field of Object.keys(form.controls)) {
      //   console.log(field);
      //   form.controls[field].markAsTouched();
      // }
      form.markAllAsTouched();
    }
  }
}
