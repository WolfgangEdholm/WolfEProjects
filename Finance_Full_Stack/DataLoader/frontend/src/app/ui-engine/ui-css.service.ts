import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CssService {
  // Constants
  public offWhite = '#f4f4f4';
  public offoffWhite = '#d9d9d9';
  public gray = '#6d6d6d';
  public lightGray = '#9c9c9c';
  public lightLightGray = '#b1b1b1';
  public stdRadius = '.3rem';

  // High level variables
  public lookId: number;
  public useCards: boolean;

  constructor(

  ) {
    this.setLook(3);
  }

  setLook(lookId: number): void {
    this.lookId = lookId;
    this.useCards = lookId === 1;
  }

  // Dynamic Styles

  xShadowOrBorder(fixedClass: string = ''): string {
    let str = fixedClass;
    str += this.useCards
      ? ' xcard-shadow'
      : ' mat-elevation-z0';
    str += this.lookId === 3 ? ' xcard-border' : '';
    return str;
  }

  xShadowOrUnderline(fixedClass: string = ''): string {
    let str = fixedClass;
    str += this.useCards
      ? ' xcard-shadow'
      : ' mat-elevation-z0';
    str += this.lookId === 3 ? ' xcard-underline' : '';
    return str;
  }

  xShadowNoBorder(fixedClass: string = ''): string {
    let str = fixedClass;
    str += this.useCards
      ? ' xcard-shadow'
      : ' mat-elevation-z0';
    return str;
  }

  xcardBgClasses(fixedClass: string): string {
    let str = fixedClass;
    str += this.useCards
      ? ' xcard-shadow'
      : ' mat-elevation-z0';
    str += this.lookId === 3 ? ' xcard-border' : '';
    return str;
  }

  xcardBgStyles(): object {
    return {
      background: this.useCards ? this.offWhite : 'white',
    };
  }

  xcardTitleStyles(): object {
    return {
      margin: this.useCards ? '.4rem .6rem' : '.2rem .6rem',
    };
  }

  xformFieldFrameClass(): string {
    return this.useCards
      ? 'xform-field-frame'
      : 'xform-field-flat-frame';
  }

  xformFieldFrameStyles(): object {
    return {
      'border-radius': this.useCards ? this.stdRadius : '0',
      'min-width': '0rem',
      margin: this.useCards
        ? '.4rem .6rem'
        : '.2rem .6rem',
      padding: this.useCards
        ? '.2rem 1rem'
        : '0',
    };
  }

  xformFieldThinFrameClass(): string {
    return this.useCards
      ? 'xform-field-thin-frame'
      : 'xform-field-thin-flat-frame';
  }

  xformFieldThinFrameStyles(): object {
    return {
      'border-radius': this.useCards
        ? this.stdRadius
        : '0',
      'min-width': '0rem',
      margin: this.useCards
        ? '.0rem .6rem'
        : '.2rem .6rem',
      padding: this.useCards
        ? '.1rem 1rem'
        : '0',
    };
  }


  // xitemThickFrameClass(): string {
  //   return this.useCards ? 'xitem-thick-frame' : 'xitem-thick-flat-frame';
  // }

  // xitemThinrameClass(): string {
  //   return this.useCards ? 'xitem-thin-frame' : 'xitem-thin-flat-frame';
  // }

  xlistItemClass(): string {
    return this.useCards
      ? 'xlist-item'
      : 'xlist-item-flat';
  }

  xlistItemFrameClass(): string {
    return this.useCards
      ? 'xlist-item-frame'
      : 'xlist-item-flat-frame';
  }

  // This includes special adjustments to make room for a scrollbar to
  // the right. Also, the vertical margins are adjusted to make the list
  // look good unscrolled.
  xlistItemFrameStyles(): object {
    return {
      'border-radius': this.useCards
        ? this.stdRadius
        : '0',
      'min-width': '0rem',
      margin: this.useCards
        ? '.5rem .6rem .8rem .5rem'
        : '0rem .6rem 0rem .5rem',
      padding: this.useCards
        ? '1rem .7rem'
        : '.6rem 0rem .6rem .4rem',
      'border-bottom': this.useCards
        ? '0 solid white'
        : '1px solid lightgray',
    };
  }

  // Dsigned for a thinner item of for an item containing an icon.
  xlistItemThinFrameStyles(): object {
    return {
      'border-radius': this.useCards
        ? this.stdRadius
        : '0',
      'min-width': '0rem',
      margin: this.useCards
        ? '.5rem .6rem .8rem .5rem'
        : '0rem .6rem 0rem .5rem',
      padding: this.useCards
        ? '.5rem .7rem'
        : '0rem 0rem 0rem .4rem',
      'border-bottom': this.useCards
        ? '0 solid white'
        : '1px solid lightgray',
    };
  }

  // *********************************************** Custom

  // Segment screen

  segmentNameInputCardClass(fixedClass: string): string {
    let str = fixedClass;
    str += this.useCards ? ' name-input-card-shadow' : '';
    return str;
  }

  segmentNameInputCardStyles(): object {
    return {
      margin: this.useCards
        ? '.5rem .6rem .5rem .5rem'
        : '0rem .0rem 0rem .0rem',
      background: this.useCards ? this.offWhite : 'white',
    };
  }
}
