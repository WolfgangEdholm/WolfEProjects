
export type RequestReturn = {
  hasError: boolean;
  data: any;
};

export class XRect {
  constructor(
  public x: number,
  public y: number,
  public width: number,
  public height: number,
  ) { }
}
