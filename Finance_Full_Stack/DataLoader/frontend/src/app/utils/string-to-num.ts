

export const isNumeric = (str: string): boolean =>
  !isNaN(str as unknown as number) && !isNaN(parseFloat(str));


export const getString = (par: any): string =>
  par as string;

