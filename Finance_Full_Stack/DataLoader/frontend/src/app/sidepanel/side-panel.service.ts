import {Injectable} from '@angular/core';

export type SidePanelLoadReturn = {
  displayName: string;
  isTopLevel: boolean;
  childCount: number;
  data: number;
  item: any;
  itemIx: number;
  childIx: number;
  skip: boolean;
};

export type SidePanelItem = {
  displayName: string;
  displayIx: number;
  isTopLevel: boolean;
  hasChildren: boolean;
  isOpen: boolean;
  data: number;
  item: any;
  itemIx: number;
  childIx: number;
};

export type SidePanelData = {
  map: Map<string, boolean>;
  items: SidePanelItem[];
  ix: number;
};

export type SidePanelLoader = (
  sourceItemIx: number,
  sourceItems: any[],
  childItemIx?: number,
) => SidePanelLoadReturn;

@Injectable({providedIn: 'root'})
export class SidePanelService {
  panes: SidePanelData[] = [];

  // private readonly leftPanelMap = new Map<string, boolean>();

  // public displayItems: SidePanelItem[];

  constructor(
  ) { }

  public rebuildSidePane(
    ix: number,
    sourceItems: any[],
    loader: SidePanelLoader,
  ): number {
    // if (!sourceItems || sourceItems.length === 0) {
    //   return -1;
    // }
    const reuse = ix !== -1 && ix !== undefined;
    const pane = reuse ? this.panes[ix] : {
      map: new Map<string, boolean>(),
      ix: this.panes.length,
    } as SidePanelData;
    if (!reuse) {
      this.panes.push(pane);
    }
    pane.items = [];

    let displayIx = 0;
    for (const [sourceIx, sourceItem] of sourceItems.entries()) {
      const params = loader(sourceIx, sourceItems);
      if (params.skip) {
        continue;
      }
      pane.items.push(this.buildPaneItem(
        pane,
        params.displayName,
        displayIx++,
        params.isTopLevel,
        params.childCount > 0,
        this.isOpen(pane.ix, params.displayName),
        params.data,
        params.item,
        params.itemIx,
        params.childIx,
      ));
      if (this.isOpen(pane.ix, params.displayName)) {
        // If parent is open, add children
        for (let childIx = 0; childIx < params.childCount; childIx++) {
          const childParams = loader(sourceIx, sourceItems, childIx);
          if (childParams.skip) {
            continue;
          }
          pane.items.push(this.buildPaneItem(
            pane,
            childParams.displayName,
            displayIx++,
            false,
            false,
            false,
            0,
            childParams.item,
            childParams.itemIx,
            childParams.childIx,
          ));
        }
      }
    }
    return pane.ix;
  }

  isInDisplayList(ix: number, mapId: string): boolean {
    return this.panes[ix].map.has(mapId);
  }

  isOpen(ix: number, mapId: string): boolean {
    return Boolean(this.panes[ix].map.get(mapId));
  }

  removeFromDisplayList(ix: number, mapId: string): void {
    this.panes[ix].map.delete(mapId);
  }

  setOpenState(ix: number, mapId: string, isOpen: boolean): void {
    this.panes[ix].map.set(mapId, isOpen);
  }

  // Private methods

  private buildPaneItem(
    pane: SidePanelData,
    displayName: string,
    displayIx: number,
    isTopLevel: boolean,
    hasChildren: boolean,
    isOpen: boolean,
    data: number,
    item: any,
    itemIx: number,
    childIx: number,
  ): SidePanelItem {
    return {
      displayName,
      displayIx,
      isTopLevel,
      hasChildren,
      isOpen,
      data,
      item,
      itemIx,
      childIx,
    } as SidePanelItem;
  }

}
