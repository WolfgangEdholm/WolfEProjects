import { Injectable } from '@angular/core';
import { UiCoreData } from '../ui/types';

@Injectable({
  providedIn: 'root'
})
export class ContextService {

  user = 'yedholm@gmail.com';

  // For toolbar
  appScreen: string;
  docName: string;

  // trans screen
  queryPaneIx = -1;
  filterPaneIx = -1;
  transPaneIx = -1;
  helperPaneIx = -1;

  // home screen
  homeQueryPaneIx = -1;
  homeFilterPaneIx = -1;
  homeTransPaneIx = -1;
  homeHelperPaneIx = -1;

  // display settings
  toolbarHeight: number;
  formIsOutline = false;

  // draw engine data
  tableData: UiCoreData;
  transData: UiCoreData;

  // Privates

  // For toolbar
  private appSection: string;

  constructor() { }

  public getAppSection = (): string =>
    this.appSection;


  public setAppSection = (screen: string): void => {
    this.appScreen = screen;
    this.changeAppSection(`${screen} - ${this.docName}`);
  };

  public setAppSectionOnly = (screen: string): void => {
    this.appScreen = screen;
    this.changeAppSection(screen);
  };

  public updateDocName = (docName: string): void => {
    this.docName = docName;
    this.changeAppSection(`${this.appScreen} - ${docName}`);
  };

  // Private methods

  private changeAppSection = async (name: string): Promise<void> => {
    Promise.resolve(null).then(() => this.appSection = name);
  };

}
