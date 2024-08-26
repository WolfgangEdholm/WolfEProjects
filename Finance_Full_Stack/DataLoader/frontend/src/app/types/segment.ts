
export type SegmentType = 'SEGMENT' | 'BALLET' | 'SUPER';

export class APIPosition {
  id: number;
  name: string;
  notes: string;
  orderOf: number;
  dancerCount: number;
  siblingId: number;
  segmentId: number;
}

type SegmentCore = {
  id: number;
  name: string;
  length: number;
  notes: string;
  siblingId: number;
  type: SegmentType;
};

export type APISegment = SegmentCore & {
  positions: APIPosition[];
};

export type Position = APIPosition & {
  isEdited: boolean;
};

export type Segment = SegmentCore & {
  positions: Position[];
  isOpen: boolean;
};
