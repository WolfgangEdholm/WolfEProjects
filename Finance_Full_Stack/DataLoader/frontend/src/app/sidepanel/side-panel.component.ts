import { Component, ViewChild, ElementRef, AfterViewInit,
  OnDestroy, OnInit, ViewChildren, QueryList, HostListener, Input
} from '@angular/core';
import { CdkDragEnd, CdkDragEnter, CdkDragExit, CdkDragRelease,
} from '@angular/cdk/drag-drop';
import { CssService } from '../ui-engine/ui-css.service';
import { DbEngService } from '../api/db-eng.service';
import { DataEngService } from '../api/data-eng.service';
import { ContextService } from '../core/context.service';
import { UiCoreService } from '../ui/ui-core.service';
import { SidePanelService } from './side-panel.service';
import { SidePanelLoadReturn, SidePanelItem } from './side-panel.service';
import { Point } from '@angular/cdk/drag-drop';

// 45678911234567892123456789312345678941234567895123456789612345678971234567898

export type BottomStart = 'bottom' | 'endOfTop' | 'top';

export enum HighlightCode {
  none,
  error,
  highlight,
}

export type DropCallback = (
  mouse: Point, point: Point, name: string, item: any) => void;
export type OpenCallback = (displayIx: number) => void;
export type SelectCallback = (displayIx: number) => void;
export type RebuildCallback = () => void;
export type IconClickCallback = () => void;
export type ItemErrorHighlight = () => void;
export type ItemHighlight = (item: SidePanelItem) => HighlightCode;

export type PaneDropCallback =
  (paneIx: number, point: Point, name: string, item: any) => void;
export type PaneOpenCallback = (paneIx: number, displayIx: number) => void;
export type PaneSelectCallback = (paneIx: number, displayIx: number) => void;
export type PaneRebuildCallback = (paneIx: number) => void;

export type ColumnRef = 'left' | 'center' | 'right';

@Component({
  selector: 'app-side-panel',
  templateUrl: './side-panel.component.html',
  styleUrls: ['./side-panel.component.scss']
})
export class SidePanelComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() column: ColumnRef = 'left';
  @Input() columnPercent = 25;

  @Input() topPaneIx = -1;
  @Input() topIx = -1;
  @Input() topTitle: string;
  @Input() topIconName = 'add';
  @Input() topIconColor = '#0000ff';
  @Input() topIconClick: IconClickCallback;
  @Input() topDrag: any;
  @Input() topDropCallback: DropCallback;
  @Input() topOpenCallback: OpenCallback;
  @Input() topSelectCallback: SelectCallback;
  @Input() topRebuildCallback: RebuildCallback;
  @Input() topPaneDropCallback: PaneDropCallback;
  @Input() topPaneOpenCallback: PaneOpenCallback;
  @Input() topPaneSelectCallback: PaneSelectCallback;
  @Input() topPaneRebuildCallback: PaneRebuildCallback;
  @Input() topErrorHighlight: ItemErrorHighlight;
  @Input() topHighlight: ItemHighlight;
  @Input() topChildHighlight: ItemHighlight;
  @Input() topItemHeight = 0;
  @Input() topChildItemHeight = 0;
  @Input() topSelectChild = false;


  @Input() bottomPaneIx = -1;
  @Input() bottomIx = -1;
  @Input() bottomTitle: string;
  @Input() bottomIconName = 'add';
  @Input() bottomIconColor = '#0000ff';
  @Input() bottomIconClick: IconClickCallback;
  @Input() bottomDrag: any;
  @Input() bottomDropCallback: DropCallback;
  @Input() bottomOpenCallback: OpenCallback;
  @Input() bottomSelectCallback: SelectCallback;
  @Input() bottomRebuildCallback: RebuildCallback;
  @Input() bottomPaneDropCallback: PaneDropCallback;
  @Input() bottomPaneOpenCallback: PaneOpenCallback;
  @Input() bottomPaneSelectCallback: PaneSelectCallback;
  @Input() bottomPaneRebuildCallback: PaneRebuildCallback;
  @Input() bottomErrorHighlight: ItemErrorHighlight;
  @Input() bottomHighlight: ItemHighlight;
  @Input() bottomChildHighlight: ItemHighlight;
  @Input() bottomItemHeight = 0;
  @Input() bottomChildItemHeight = 0;
  @Input() bottomSelectChild = false;
  @Input() bottomStartPosition: BottomStart = 'bottom';

  // moved here to avoid line warnings
  topSelectedItemIx = -1;
  topSelectedDisplayIx = -1;

  bottomSelectedItemIx = -1;
  bottomSelectedDisplayIx = -1;

  // end setup parameters

  spExpandedCode = 0;

  // list of existing droptargets
  dropList;

  showLeftColumn = true;
  // leftColumnSize = 100;
  // rightColumnSize: number;

  isOutsideInDragging = false;

  // stdTrans = [
  //   'Side Sort Filter',
  //   'Numeric Filter',
  //   'Format Filter',
  //   'Concat Filter',
  //   'Extract Filter',
  // ];
  selectedStdTrans: string;

  removeIsDisabled = false;
  editIsDisabled = false;
  saveIsDisabled = true;
  getDataIsDisabled = false;

  constructor(
    public dbEng: DbEngService,
    public dataEng: DataEngService,
    // don't remove computeEng for initialization reasons
    // (loading compute engine hooks it up to data engine)
    // public computeEng: ComputeService,

    public css: CssService,
    public g: ContextService,
    public sps: SidePanelService,
    public core: UiCoreService,
  ) {
    // console.log('-------------------------------SidePane');
  }

  // to prevent text selcetion by doubleclick,
  @HostListener('document:mousedown', ['$event'])
  eatMouseDown(e: MouseEvent): void {
    if (e.detail > 1) {
      e.preventDefault();
    }
  }

  public async ngOnInit(): Promise<void> {
    if (this.bottomStartPosition === 'bottom') {
      this.spExpandedCode = 2;
    } else if (this.bottomStartPosition === 'top') {
      this.spExpandedCode = 1;
    }
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
  }

  // Left Pane Support

  // public showHideLeftPane(): void {
  //   this.showLeftColumn = !this.showLeftColumn;
  //   // if (this.showLeftColumn) {
  //   //   this.rightColumnSize = 100 - this.leftColumnSize;
  //   // } else {
  //   //   this.rightColumnSize = 100;
  //   // }
  // }

  toggleExpanded(): void {
    this.spExpandedCode += (this.spExpandedCode === 2) ? -2 : 1;
  }

  public onTopIconClick(): void {
    if (this.topIconClick) {
      this.topIconClick();
    }
  }

  public selectTopItem(displayIx: number): void {
    this.topSelect(displayIx);
    if (this.topPaneSelectCallback) {
      this.topPaneSelectCallback(this.topPaneIx, displayIx);
    } else if (this.topSelectCallback) {
      this.topSelectCallback(displayIx);
    }
  }

  // utility function
  public topSelectCode(item: SidePanelItem): number {
    if (!this.topSelectChild && item.itemIx === this.topSelectedItemIx) {
      return 1;
    }
    if (this.topSelectChild
      && item.displayIx === this.topSelectedDisplayIx) {
      return 2;
    }
    return 0;
  }

  public topItemOpenToggle(displayIx: number): void {
    this.topSelect(displayIx);
    const item = this.sps.panes[this.topIx].items[displayIx];
    if (this.topPaneOpenCallback || this.topPaneRebuildCallback) {
      if (this.topPaneOpenCallback) {
        this.topPaneOpenCallback(this.topPaneIx, displayIx);
      } else if (item.isTopLevel && this.topPaneRebuildCallback) {
        item.isOpen = !item.isOpen;
        this.sps.setOpenState(this.topIx, item.displayName, item.isOpen);
        if (this.topPaneRebuildCallback) {
          this.topPaneRebuildCallback(this.topPaneIx);
        }
      }
    } else {
      if (this.topOpenCallback) {
        this.topOpenCallback(displayIx);
      } else if (item.isTopLevel && this.topRebuildCallback) {
        item.isOpen = !item.isOpen;
        this.sps.setOpenState(this.topIx, item.displayName, item.isOpen);
        if (this.topRebuildCallback) {
          this.topRebuildCallback();
        }
      }
    }
  }

  public onTopDragEntered(event: CdkDragEnter<any>): void {
    // // console.log('cdkDragEntered', event);
    // if (event.container.element.nativeElement
    //   === this.tTarget.nativeElement) {
    //   this.isOutsideInDragging = true;
    //   // console.log('ENTERED - TARGET', event);
    // } else if (event.container.element.nativeElement ===
    //   this.tSource.nativeElement) {
    //   // console.log('ENTERED - SOURCE', event);
    // }
  }

  public onTopDragExited(event: CdkDragExit<any>): void {
    // // console.log('cdkDragExited', event);
    // if (event.container.element.nativeElement
    //   === this.tTarget.nativeElement) {
    //   // console.log('EXITED - TARGET', event);
    // } else if (event.container.element.nativeElement ===
    //   this.tSource.nativeElement) {
    //   // console.log('EXITED - SOURCE', event);
    // }
  }

  public onTopDragReleased(event: CdkDragRelease): void {
    // this.isOutsideInDragging = false;
    // eslint-disable-next-line no-underscore-dangle
    const dragRef: any = event.source._dragRef;
    // eslint-disable-next-line no-underscore-dangle
    const mouse = dragRef._lastKnownPointerPosition;
    // eslint-disable-next-line no-underscore-dangle
    const offset = dragRef._pickupPositionInElement;
    // const localPoint = this.core.globalToLocal(
    //   { x: mouse.x - offset.x, y: mouse.y - offset.y });
    const globalPoint = { x: mouse.x - offset.x, y: mouse.y - offset.y };
    const data = event.source.data;
    if (this.topPaneDropCallback) {
      this.topPaneDropCallback(
        this.topPaneIx, globalPoint, data.displayName, data.item);
    } else if (this.topDropCallback) {
      this.topDropCallback(mouse, globalPoint, data.displayName, data.item);
    }
  }

  public checkTopHighlight(item: SidePanelItem): string {
    if (this.topHighlight) {
      const code = this.topHighlight(item);
      if (code !== HighlightCode.none) {
        return code === HighlightCode.error ? 'item-error' : 'item-highlight';
      }
    }
    return '';
  }

  public checkTopChildHighlight(item: SidePanelItem): string {
    if (this.topChildHighlight) {
      const code = this.topChildHighlight(item);
      if (code !== HighlightCode.none) {
        return code === HighlightCode.error ? 'item-error' : 'item-highlight';
      }
    }
    return '';
  }

  public onBottomIconClick(): void {
    if (this.bottomIconClick) {
      this.bottomIconClick();
    }
  }

  public selectBottomItem(displayIx: number): void {
    this.bottomSelect(displayIx);
    if (this.bottomPaneSelectCallback) {
      this.bottomPaneSelectCallback(this.bottomPaneIx, displayIx);
    } else if (this.bottomSelectCallback) {
      this.bottomSelectCallback(displayIx);
    }
  }

  // utility function
  public bottomSelectCode(item: SidePanelItem): number {
    if (!this.bottomSelectChild && item.itemIx === this.bottomSelectedItemIx) {
      return 1;
    }
    if (this.bottomSelectChild
      && item.displayIx === this.bottomSelectedDisplayIx) {
      return 2;
    }
    return 0;
  }

  bottomItemOpenToggle(displayIx: number): void {
    this.bottomSelect(displayIx);
    if (this.bottomPaneOpenCallback) {
      this.bottomPaneOpenCallback(this.bottomPaneIx, displayIx);
    }
    else if (this.bottomOpenCallback) {
      this.bottomOpenCallback(displayIx);
    }
  }
  public onBottomDragEntered(event: CdkDragEnter<any>): void {
    // // console.log('cdkDragEntered', event);
    // if (event.container.element.nativeElement
    //   === this.tTarget.nativeElement) {
    //   this.isOutsideInDragging = true;
    //   // console.log('ENTERED - TARGET', event);
    // } else if (event.container.element.nativeElement ===
    //   this.tSource.nativeElement) {
    //   // console.log('ENTERED - SOURCE', event);
    // }
  }

  public onBottomDragExited(event: CdkDragExit<any>): void {
    // // console.log('cdkDragExited', event);
    // if (event.container.element.nativeElement
    //   === this.tTarget.nativeElement) {
    //   // console.log('EXITED - TARGET', event);
    // } else if (event.container.element.nativeElement ===
    //   this.tSource.nativeElement) {
    //   // console.log('EXITED - SOURCE', event);
    // }
  }

  public onBottomDragReleased(event: CdkDragRelease): void {
    // this.isOutsideInDragging = false;
    // eslint-disable-next-line no-underscore-dangle
    const dragRef: any = event.source._dragRef;
    // eslint-disable-next-line no-underscore-dangle
    const mouse = dragRef._lastKnownPointerPosition;
    // eslint-disable-next-line no-underscore-dangle
    const offset = dragRef._pickupPositionInElement;
    // const localPoint = this.core.globalToLocal(
    //   { x: mouse.x - offset.x, y: mouse.y - offset.y });
    const globalPoint = { x: mouse.x - offset.x, y: mouse.y - offset.y };
    const data = event.source.data;
    if (this.bottomPaneDropCallback) {
      this.bottomPaneDropCallback(
        this.bottomPaneIx, globalPoint, data.displayName, data.item);
    } else if (this.bottomDropCallback) {
      this.bottomDropCallback(mouse, globalPoint, data.displayName, data.item);
    }
  }

  public checkBottomHighlight(item: SidePanelItem): string {
    if (this.bottomHighlight) {
      const code = this.bottomHighlight(item);
      if (code !== HighlightCode.none) {
        return code === HighlightCode.error ? 'item-error' : 'item-highlight';
      }
    }
    return '';
  }

  public checkBottomChildHighlight(item: SidePanelItem): string {
    if (this.bottomChildHighlight) {
      const code = this.bottomChildHighlight(item);
      if (code !== HighlightCode.none) {
        return code === HighlightCode.error ? 'item-error' : 'item-highlight';
      }
    }
    return '';
  }

  // Private methods

  private topSelect(displayIx: number): void {
    const item = this.sps.panes[this.topIx].items[displayIx];
    this.topSelectedItemIx = item.itemIx;
    this.topSelectedDisplayIx = item.displayIx;
    this.bottomSelectedItemIx = -1;
    this.bottomSelectedDisplayIx = -1;
  }

  private bottomSelect(displayIx: number): void {
    const item = this.sps.panes[this.bottomIx].items[displayIx];
    this.bottomSelectedItemIx = item.itemIx;
    this.bottomSelectedDisplayIx = item.itemIx;
    this.topSelectedItemIx = -1;
    this.topSelectedDisplayIx = -1;
  }

}
