
export const magnify = false;

export const dpr = window.devicePixelRatio;
// click scaling
export const csc = magnify ? 1 / dpr : 1;
// size scaling
export const sizeSc = magnify ? 1 : dpr;

export const black = 'rgb(0, 0, 0)';
export const red = 'rgb(255, 0, 0)';
export const blue = 'rgb(0, 0, 255)';

export const errColor = 'rgb(255, 0, 0)';
export const warnColor = 'rgb(255, 96, 0)';

export const titleBg = 'rgb(15, 160, 160)';
export const titleFg = 'rgb(255, 255, 255)';
export const bodyBg = 'rgb(255, 255, 255)';
// export const queryBodyBg = 'rgb(20, 200, 200)';
// export const filterBodyBg = 'rgb(255, 200, 0)';
// export const transBodyBg = 'rgb(200, 200, 200)';
export const frameColor = 'rgb(200, 200, 200)';
export const bodyFg = 'rgb(50, 50, 50)';
export const requestFg = 'rgb(100, 100, 100)';
export const selectBg = 'rgb(220, 220, 220)';
export const dropFrame = 'rgb(15, 160, 160)';

export const titleIconFont = `24px Material Icons`;
export const titleFontSize = 20;
export const titleFont = `${titleFontSize}px "Helvetica Neue", sans-serif`;
export const bodyFontSize = 16;
export const bodyFont = `${bodyFontSize}px "Helvetica Neue", sans-serif`;

export const tableIconFont = `18px Material Icons`;
export const transIconFont = `48px Material Icons`;

export const stdLineWidth = 2;
export const currLineWidth = 4;

export const cvRightMarg = 20;
export const cvBottomMarg = 20;

let partCount = 0;
export const firstTableCode = partCount++;
export const tableOther = partCount++;
export const tableLeftTop = partCount++;
export const tableLeftMiddle = partCount++;
export const tableLeftBottom = partCount++;
export const tableCenterTop = partCount++;
export const tableCenterMiddle = partCount++;
export const tableCenterBottom = partCount++;
export const tableRightTop = partCount++;
export const tableRightMiddle = partCount++;
export const tableRightBottom = partCount++;
export const tableTitleBar = partCount++;
export const tableCenterMiddleBelow = partCount++;
export const tableLeftColumn = partCount++;
export const lastTableCode = partCount++;

export const firstJoinCode = partCount++;
export const lastJoinCode = partCount++;

export const firstRequestCode = partCount++;
export const requestColumn0 = partCount++;
// Make room for 1000 request columns
partCount += 1000;
export const columnFillCode = partCount++;
export const lastRequestCode = partCount++;


export const firstTransCode = partCount++;
// must be here so the code order of the follong codes is corrent
export const transOther = partCount++;
export const transLeftTop = partCount++;
export const transLeftMiddle = partCount++;
export const transLeftBottom = partCount++;
export const transCenterTop = partCount++;
export const transCenterMiddle = partCount++;
export const transCenterBottom = partCount++;
export const transRightTop = partCount++;
export const transRightMiddle = partCount++;
export const transRightBottom = partCount++;
export const transTitleBar = partCount++;
export const transBody = partCount++;
export const lastTransCode = partCount++;

export const firstArrowCode = partCount++;
export const lastArrowCode = partCount++;

export let eventCount = 0;
export const changeHappened = eventCount++;
export const draw = eventCount++;
export const updateExtent = eventCount++;
export const updateStatus = eventCount++;

export let mouseEventCount = 0;
export const onDragOver = mouseEventCount++;

export let utilityProcCount = 0;
export const uiiInfoToMgr = utilityProcCount++;
export const clearCurrentItem = utilityProcCount++;
