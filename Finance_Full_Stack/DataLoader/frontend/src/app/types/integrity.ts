
// Report Item
export type QueryIntegrityCheckItem = {
  id: number;
  diId: number;
  dbQueryName: string;
  requestColumn: string;
  dbTblColSource: string;
  type: string;
  changeDate: string;
  fixDate: string;
  okDate: string; // not used for now

  creator: string;
  modifier: string;
  created: string;
  modified: string;
};

// Database Item
export type DataIntegrityItem = {
  id: number;
  diId: number;
  seqNum: number;
  dbTblName: string;
  colName: string;
  dbTblColSource: string;
  type: string;
  fixDate: string;
  outOfSyncDate: string;

  creator: string;
  modifier: string;
  created: string;
  modified: string;
};

// Database Item
export type DataIntegrity = {
  id: number;
  dbTblName: string;
  outOfSyncDate: string;
  runDate: string;

  creator: string;
  modifier: string;
  created: string;
  modified: string;

  items: DataIntegrityItem[];
};

export type ApiDataIntegrity = DataIntegrity & {
  itemIds: number[];
};

export type StructIntegrityItem = {
  id: number;
  siId: number;
  seqNum: number;
  dbTblColName: string;
  changeDate: string;
  type: string;
  oldType: string;
  comment: string;

  creator: string;
  modifier: string;
  created: string;
  modified: string;
};

export type StructIntegrity = {
  id: number;
  dbTblName: string;

  creator: string;
  modifier: string;
  created: string;
  modified: string;

  items: StructIntegrityItem[];
};

export type ApiStructIntegrity = StructIntegrity & {
  itemIds: number[];
};

export type ApiStructIntegrityQueryColumns = {
  columns: string[];
};
