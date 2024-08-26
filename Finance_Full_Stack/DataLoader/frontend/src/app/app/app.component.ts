import { Component, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef,
} from '@angular/core';
import { NavItem } from 'src/types';
import { constNavbarEntries } from '../../constants';
import { ContextService } from '../core/context.service';
import { CssService } from '../ui-engine/ui-css.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('toolbar', { static: false, read: ElementRef }) toolbar: ElementRef;

  app = 'planLoad';
  navItems: NavItem[] = constNavbarEntries;

  constructor(
    // private cdr: ChangeDetectorRef,
    public css: CssService,
    public g: ContextService,
  ) { }

  ngAfterViewInit(): void {
    // this.cdr.detectChanges();
    this.g.toolbarHeight = this.toolbar.nativeElement.scrollHeight;
  }
}
