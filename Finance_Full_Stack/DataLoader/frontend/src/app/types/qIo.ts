

export type IoQueryItemKind =
// 'sourceDatabase' |
// 'sourceTable' |
'queryTable' |
'queryJoin' |
'queryConstraint' |
'requestColumn' |
'workData' |
'workComputed' |
'queryParams' |
'delete' ;

export type IoJust =
'JUST_DEFAULT' |
'JUST_LEFT' |
'JUST_CENTER' |
'JUST_RIGHT';

// For db save
export type IoJoinOperator =
  'eq' | 'EQ' |
  'ne' | 'NE' |
  'lt' | 'LT' |
  'le' | 'LE' |
  'gt' | 'GT' |
  'ge' | 'GE';

export type IoConstraintOperator = IoJoinOperator &
  'in' | 'IN' ;

export type IoQueryItem = {
  id: number;
  queryId: number;
  seqNum: number;
  itemKind: IoQueryItemKind;
  itemName: string;
  param1: string;
  param2: string;

  creator: string;
  modifier: string;
  created: string;
  modified: string;
};

export type IoQuery = {
  id: number;
  dbQueryName: string;
  oldDbQueryName: string;
  okDate: string;
  outputIsTemporary: boolean;

  creator: string;
  modifier: string;
  created: string;
  modified: string;

  items: IoQueryItem[];
};

export type ApiIoQuery = IoQuery & {
  itemIds: number[];
  ix: number;
};
