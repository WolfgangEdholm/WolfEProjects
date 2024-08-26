import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { FilterParamsComponent
} from '../filter-params/filter-params.component';
import { SaveMd2Component } from './save/save-md2.component';
import { ShowTableMd2Component
} from './show-table-md2/show-table-md2.component';
import { ShowTable2Md2Component
} from './show-table2-md2/show-table2-md2.component';
import { TablePickerMd2Component
} from './table-picker/table-picker.component';
import { TestMd2Component } from './test/test-md2.component';
import { TransResultsMd2Component
} from './trans-results-md2/trans-results-md2.component';


// 45678911234567892123456789312345678941234567895123456789612345678971234567898


@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
  ],
  declarations: [
    FilterParamsComponent,
    SaveMd2Component,
    ShowTableMd2Component,
    ShowTable2Md2Component,
    TablePickerMd2Component,
    TestMd2Component,
    TransResultsMd2Component,
  ],
  exports: [
    FilterParamsComponent,
    SaveMd2Component,
    ShowTableMd2Component,
    ShowTable2Md2Component,
    TablePickerMd2Component,
    TestMd2Component,
    TransResultsMd2Component,
  ],
})
export class Md2Module { }
