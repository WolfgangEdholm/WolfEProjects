import { EventEmitter, Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import * as Modal from '../services/modal.service';
import { RequestReturn } from '../types/shared';
import { UIEng } from '../ui-engine/ui-eng.service';
import { APIPosition, APISegment, Position, Segment, SegmentType,
} from '../types/segment';
import { RepoService } from './repo.service';


@Injectable({
  providedIn: 'root'
})
export class SegmentEng {


  public isLoading = false;
  public dataItems: Segment[];
  public map = new Map<number, Segment>();
  public dataEmitter: EventEmitter<Segment[]> = new EventEmitter();

  // Extension fields

  // holds the current segment
  public currSegment: Segment | undefined;
  // used to create new edit fields / positions

  public typeName: string;
  public typeDescription: string;

  private dataUrl = `api/segment`;
  // 0 ~ add, > 0 ~ edit
  private currDataId = -1;

  private lastPositionOrderOf: number;

  constructor(
    private modal: Modal.ModalService,
    public uie: UIEng,
    public repo: RepoService,
  ) { }

  // Getters and setters

  public get itemCount(): number {
    return this.dataItems?.length ?? 0;
  }

  public get itemId(): number {
    return this.currDataId;
  }

  public set itemId(id: number) {
    this.currDataId = id;
  }

  // Standard utility methods

  public findItem(id: number): Segment | undefined {
    if ((this.dataItems?.length ?? 0) === 0) {
      return undefined;
    }
    // Must use == rather than === in test belov. Don't know why.
    // Is one of the items a string?
    // I believe this is fixed now
    return this.dataItems.find(user => user.id === id);
  }

  public getTypeNum(typeStr: SegmentType): number {
    return typeStr === 'BALLET' ? 1 :
      typeStr === 'SEGMENT' ? 0 : 2;
  }

  public setCurrSegment(segment: Segment): void {
    this.currDataId = segment.id;
    // Make copy if segment so we can abort edit without doing
    // too much cleanup
    this.currSegment = Object.assign({}, segment);
    // this.currSegment.positions = Array.from(segment.positions);
    this.currSegment.positions = [];
    this.currSegment.positions.push(...segment.positions);
    this.lastPositionOrderOf = this.currSegment.positions.length;
  }

  // Start of main functions

  public async loadAll(): Promise<boolean> {
    this.isLoading = true;
    console.log('SEGMENT ENGINE: loadAll');
    const response = await this.repo.xloadAll(this.dataUrl);
    if (!response.hasError) {
      this.dataItems = response.data as Segment[];
      this.map.clear();
      for (const item of this.dataItems) {
        this.map.set(item.id, item);
      }
      this.dataEmitter.emit(this.dataItems);
      this.isLoading = false;
      return true;
    }
    return false;
  }

  public async add(typeCode: number): Promise<Segment | undefined> {
    if (this.currDataId >= 0) {
      const ok = await this.editsExist();
      if (ok) {
        return this.doAdd(typeCode);
      }
      return undefined;
    }
    return this.doAdd(typeCode);
  }

  public async delete(): Promise<boolean> {
    if (this.currDataId <= 0) {
      return false;
    }
    if (!await this.modal.confirmDelete().then((resp: Modal.CodeReturn) =>
        resp.code === Modal.ReturnCode.ok)) {
      return false;
    }
    const deleteRet = await this.repo.xdelete(this.dataUrl, this.currDataId,
      this.currSegment);
    if (!deleteRet.hasError) {
      await this.loadAll().then(res =>
        this.doEdit(this.dataItems[0])
      );
    }
    return true;
  }

  public async edit(segment: Segment): Promise<Segment | undefined> {
    if (this.currDataId >= 0) {
      const ok = await this.editsExist();
      if (ok) {
        return this.doEdit(segment);
      }
      return undefined;
    } else {
      return this.doEdit(segment);
    }
  }

  public async editsExist(): Promise<boolean> {
    let goOn = true;
    if (this.uie.forms[0] && !this.uie.forms[0].pristine) {
      goOn = await this.modal.confirmEditExit()
        .then((resp: Modal.CodeReturn) =>
          resp.code === Modal.ReturnCode.ok);
    }
    return Promise.resolve(goOn);
  }

  public async submit(): Promise<boolean> {
    console.log('ENG SUBMIT');
    let requestReturn: RequestReturn;
    this.uie.touchForm();
    const apiSegment = this.fromForm();

    if (this.currDataId > 0) {
      requestReturn = await this.repo.xupdate(this.dataUrl,
        this.currDataId, apiSegment);
    } else {
      requestReturn = await this.repo.xcreate(this.dataUrl, apiSegment);
    }
    if (!requestReturn.hasError) {
      this.loadAll();
      console.log('SUMBIT END return =', requestReturn);
      this.currDataId = requestReturn.data.id;
      this.doEdit(requestReturn.data);
    }
    return !requestReturn.hasError;
  }

  // End of main functions

  // Start of standard form functions

  // End of standard form functions

  // Start of record specific functions that may not exist for other records

  public doAddPosition(): void {
    console.log('doAddPosition');
    const position = this.newDataChildRecord();
    position.name = this.currSegment.type === 'BALLET' ? 'New Position' :
      'New Ballet';
    position.dancerCount = this.currSegment.type === 'BALLET' ? 1 : -1;
    position.orderOf = this.lastPositionOrderOf++;
    position.segmentId = this.currDataId;
    this.currSegment.positions.push(position);
    this.addPositionToForm(position);
  }

  public doEditPosition(ix: number): void {
    const position = this.currSegment.positions[ix];
    this.addPositionToForm(position);
  }

  public doDeletePosition(ix: number): void {
    const position = this.currSegment.positions[ix];
    if (position.id === 0) {
      // Recently added not in database
      this.currSegment.positions.splice(ix, 1);
    } else {
      this.currSegment.positions[ix].id = - this.currSegment.positions[ix].id;
    }
    this.removePositionFormForm(position);
  }

  public doMovePosition(startIx: number, endIx: number): void {
    if (startIx === endIx) {
      return;
    }
    moveItemInArray(this.currSegment.positions, startIx, endIx);
  }

  // End of Record specific functions that may not exist for other records

  // Private methods

  private doAdd(typeCode: number): Segment {
    const segment = this.newDataRecord();
    switch (typeCode) {
    case 0:
      segment.type = 'SEGMENT';
      segment.name = 'New Segment';
      this.typeDescription = 'Segment';
      break;
    case 1:
      segment.type = 'BALLET';
      segment.name = 'New Ballet';
      this.typeDescription = 'Ballet';
      break;
    case 2:
      segment.type = 'SUPER';
      segment.name = 'New Super Ballet';
      segment.isOpen = true;
      this.typeDescription = 'Super Ballet';
      break;
    }
    this.setCurrSegment(segment);
    this.dataItems.push(this.currSegment);
    this.toForm(segment);
    console.log('NEW SEGMENT');
    return segment;
  }

  private doEdit(dataItem: Segment): Segment {
    this.currDataId = dataItem.id;
    this.setCurrSegment(dataItem);
    this.toForm(dataItem);
    console.log('EDIT SEGMENT');
    return dataItem;
  }

  private toForm(segment: Segment): UIEng {
    if (!segment) {
      return this.uie;
    }
    this.uie.forms[0] = new FormGroup({
      name: new FormControl(
        segment.name, {
        validators: [
          Validators.required,
          Validators.maxLength(50),
        ],
        updateOn: 'blur'
      }),
    });
    // this.uie.forms[0];
    this.uie.errorMessage = '';
    return this.uie;
  }

  private fromForm(): APISegment {
    const formValues = this.uie.forms[0].getRawValue();
    console.log('FORM FIELDS', formValues);
    // build new api position array
    const apiPositions: APIPosition[] = [];
    for (let i = 0; i < this.currSegment.positions.length; i++) {
      const pos = this.currSegment.positions[i];
      if (pos.id < 0) {
        continue;
      }
      const apiPosition: APIPosition = {
        id: pos.id,
        name: pos.isEdited ? formValues[`n${pos.orderOf}`] : pos.name,
        notes: pos.notes,
        orderOf: i,
        dancerCount: (pos.isEdited && pos.siblingId === 0) ?
          Number(formValues[`dc${pos.orderOf}`]) : pos.dancerCount,
        siblingId: pos.siblingId,
        segmentId: pos.segmentId,
      };
      apiPositions.push(apiPosition);
    }
    for (const pos of this.currSegment.positions) {
      if (pos.id < 0) {
        const apiPosition: APIPosition = {
          id: pos.id,
          name: '',
          notes: '',
          orderOf: 0,
          dancerCount: 0,
          siblingId: pos.siblingId,
          segmentId: pos.segmentId,
        };
        apiPositions.push(apiPosition);
      }
    }
    const apiSegment: APISegment = {
      id: this.currDataId,
      name: formValues.name,
      length: this.currSegment.length,
      notes: this.currSegment.notes,
      siblingId: this.currSegment.siblingId,
      type: this.currSegment.type,
      positions: apiPositions,
    };
    console.log('AFTER FROM FORM', apiSegment);
    this.uie.forms[0] = undefined;
    return apiSegment;
  }

  private addPositionToForm(position: Position): void {
    position.isEdited = true;
    this.uie.forms[0].addControl(`n${position.orderOf}`,
      new FormControl(position.name, {
        validators: [
          Validators.required,
          Validators.maxLength(50),
        ],
        updateOn: 'blur'
      }));
    if (position.siblingId === 0) {
      this.uie.forms[0].addControl(`dc${position.orderOf}`,
      new FormControl(position.dancerCount, {
        validators: [
          Validators.required,
          Validators.pattern(/^[0-9]\d*$/),
        ],
      }));
    }
    console.log('ADD TO FORM', this.uie.forms[0]);
  }

  private removePositionFormForm(position: Position): void {
    this.uie.forms[0].removeControl(`n${position.orderOf}`);
    if (position.siblingId === 0) {
      this.uie.forms[0].removeControl(`dc${position.orderOf}`);
    }
    console.log('REMOVE FROM FORM', this.uie.forms[0]);
  }

  private newDataRecord(): Segment {
    const segment: Segment = {
      id: 0,
      name: '',
      length: 0,
      notes: '',
      siblingId: 0,
      type: 'SEGMENT',
      positions: [],
      isOpen: false,
    };
    return segment;
  }

  private newDataChildRecord(): Position {
    const position: Position = {
      id: 0,
      name: '',
      notes: '',
      orderOf: 0,
      dancerCount: 0,
      siblingId: 0,
      segmentId: 0,
      isEdited: false,
    };
    return position;
  }

}
