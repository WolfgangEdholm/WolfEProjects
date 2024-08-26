

export const PARAM2_MAXLENGTH = 250;

export type IoTransItemKind =
  // 'undef' |
  'arrow' | // don't use
  'filter' |  // don't use
  'transFilter' | // a transItem that is a filter
  'transHelper' |
  'transQuery' |
  'transTrans' |
  'delete' ;  // don't use

export type IoTransItem = {
  id: number;
  transId: number;
  seqNum: number;
  itemKind: IoTransItemKind;
  itemName: string;
  param1: string;
  param2: string;

  creator: string;
  modifier: string;
  created: string;
  modified: string;
};

export type IoTrans = {
  id: number;
  dbTransName: string;
  oldDbTransName: string;
  okDate: string;

  creator: string;
  modifier: string;
  created: string;
  modified: string;

  items: IoTransItem[];
};

export type ApiIoTrans = IoTrans & {
  itemIds: number[];
  ix: number;
};

