import { Component, OnInit } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { UIEng } from '../ui-engine/ui-eng.service';
import { CssService } from '../ui-engine/ui-css.service';
import { SegmentEng } from '../api/segment-eng.service';
import { Segment, Position } from '../types/segment';
import { SidePanelService } from '../sidepanel/side-panel.service';
import { SidePanelLoadReturn } from '../sidepanel/side-panel.service';


@Component({
  selector: 'app-segment-editor',
  templateUrl: './segment-editor.component.html',
  styleUrls: ['./segment-editor.component.scss']
})
export class SegmentEditorComponent implements OnInit {
  public prettyPrintTypes = ['Segment', 'Ballet', 'Super Ballet'];

  lpTopIx = -1;
  leftColumnSize = 25;
  rightColumnSize = 75;

  constructor(
    public eng: SegmentEng,
    public css: CssService,
    public sp: SidePanelService,
  ) { }

  // Start of standard accessor functions

  public get currentItemId(): number { return this.eng.itemId; }
  public get uie(): UIEng { return this.eng.uie; }

  public set setCurrentItemId(id: number) {
    this.eng.itemId = id;
  }

  // End of standard accessor functions

  public async ngOnInit(): Promise<void> {
    this.eng.dataEmitter.subscribe(() => this.onLoadData());
    await this.eng.loadAll();
    if (this.eng.itemCount > 0) {
      this.onEdit(0);
    } else {
      this.onAdd(0);
    }
  }

  public onLoadData(): void {
    console.log('Segment Data Loaded', this.eng.dataItems);
    this.buildLeftList();
  }

  // Start of main command functions

  public async onAdd(typeCode: number): Promise<void> {
    const segment = await this.eng.add(typeCode);
    if (segment) {
      this.buildLeftList();
    }
  }

  public onDelete(): void {
    if (this.eng.delete()) {
      this.buildLeftList();
    }
  }

  public onSubmit(): void {
    this.eng.uie.touchForm();
    if (this.eng.uie.forms[0].valid) {
      this.eng.submit();
    }
  }

  // End of main command functions

  // Start of position command functions

  public onAddPosition(): void {
    this.eng.doAddPosition();
  }

  public onEditPosition(ix: number): void {
    this.eng.doEditPosition(ix);
  }

  public onDeletePosition(ix: number): void {
    this.eng.doDeletePosition(ix);
  }

  public onMovePosition(event: CdkDragDrop<any>): void {
    this.eng.doMovePosition(event.previousIndex, event.currentIndex);
  }

  public calcEditFieldName(ix: number, name: string): string {
    return `${name}${this.eng.currSegment.positions[ix].orderOf}`;
  }

  // End of position command functions

  // Utility functions

  public loadSegments = (
    itemIx: number,
    items: Segment[],
    childIx: number = -1,
  ): SidePanelLoadReturn => {
    const segment = items[itemIx];
    const childCount = segment.type === 'SUPER' ? segment.positions.length : 0;
    const dataSegment = childIx === -1
      ? segment
      : this.eng.map.get(segment.positions[childIx].siblingId);
    const hasAsterisk = dataSegment.type === 'SEGMENT'
      ? false
      : dataSegment.positions.length === 0;
    // console.log('SEGMENTS', dataSegment.name, childIx);
    return {
      displayName: `${hasAsterisk ? '*' : ''}${dataSegment.name}`,
      isTopLevel: childIx === -1,
      childCount,
      data: undefined,
      item: segment,
      itemIx,
      childIx,
      skip: segment.type === 'BALLET' && segment.siblingId > 0,
    } as SidePanelLoadReturn;
  };

  public rebuildTopLeftPane = (): void => {
    this.lpTopIx = this.sp.rebuildSidePane(
      this.lpTopIx, this.eng.dataItems, this.loadSegments);
  };

  public onEdit = async (ix: number): Promise<void> => {
    const spItem = this.sp.panes[this.lpTopIx].items[ix];
    let segment = spItem.item as Segment;
    if (spItem.childIx > -1) {
      const childId = segment.positions[spItem.childIx].siblingId;
      segment = this.eng.map.get(childId);
    }
    await this.eng.edit(segment);
  };

  // Private methods

  private buildLeftList(): void {
    console.log('REBUILD');
    this.rebuildTopLeftPane();
  }

}
