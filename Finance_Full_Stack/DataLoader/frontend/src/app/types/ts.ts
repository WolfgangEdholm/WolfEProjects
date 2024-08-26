import { IoTransItemKind } from './tIo';

export type TransIntegrityCheckItem = {
  id: number;
  tsId: number;
  dbTransName: string;
  itemName: string;
  dbItemName: string;
  itemKind: IoTransItemKind;
  changeDate: string;
  fixDate: string;
  okDate: string; // not used for now

  creator: string;
  modifier: string;
  created: string;
  modified: string;
};

export type TransSourceInItem = {
  id: number;
  tsId: number;
  seqNum: number;
  dbTransName: string;
  itemName: string;
  dbItemName: string;
  itemKind: string;
  fixDate: string;

  creator: string;
  modifier: string;
  created: string;
  modified: string;
};

export type TransSourceIn = {
  id: number;
  dbTransName: string;
  okDate: string;

  creator: string;
  modifier: string;
  created: string;
  modified: string;

  items: TransSourceInItem[];
};

export type ApiTransSourceIn = TransSourceIn & {
  itemIds: number[];
};

export type TransSourceOutItem = {
  id: number;
  tsId: number;
  seqNum: number;
  dbTransItem: string;
  changeDate: string;
  itemKind: IoTransItemKind;
  comment: string;

  creator: string;
  modifier: string;
  created: string;
  modified: string;
};

export type TransSourceOut = {
  id: number;
  dbTransName: string;

  creator: string;
  modifier: string;
  created: string;
  modified: string;

  items: TransSourceOutItem[];
};

export type ApiTransSourceOut = TransSourceOut & {
  itemIds: number[];
};

export type ApiTransSourceOutTransItems = {
  items: string[];
};
