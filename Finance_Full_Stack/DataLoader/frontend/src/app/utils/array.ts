

export const convertArrayToString = (
  arr: string[],
  maxStrLen: number,
  strValueDelimiter: string,
): string[] => {
  console.log('IN', ...arr);
  const out = [];
  let left = 0;
  let strCount = 0;
  for (const str of arr) {
    if (strCount > 0) {
      left -= strValueDelimiter.length;
    }
    if (str.length > left) {
      out.push('');
      left = maxStrLen;
      strCount = 0;
    }
    if (strCount > 0) {
      out[out.length - 1] += strValueDelimiter;
    }
    out[out.length - 1] += str;
    strCount += 1;
    console.log('LOOP', out[out.length - 1]);
  }
  return out;
};

export const moveArrayItems = (
  arr: any[],
  from: number,
  to: number,
  count: number,
): any[] => {
  if (count < 1 || from === to) {
    return arr;
  }
  if (to < from) {
    for (let moveJx = 0; moveJx < count; moveJx++) {
      const fromIx = from + moveJx;
      const toIx = to + moveJx;
      const temp = arr[fromIx];
      for (let moveIx = fromIx; toIx < moveIx--;) {
        arr[moveIx + 1] = arr[moveIx];
      }
      arr[toIx] = temp;
    }
  } else {
    for (let moveJx = count; 0 < moveJx--;) {
      const fromIx = from + moveJx;
      const toIx = to + moveJx;
      const temp = arr[fromIx];
      for (let moveIx = fromIx; moveIx < toIx; moveIx++) {
        arr[moveIx] = arr[moveIx + 1];
      }
      arr[toIx] = temp;
    }
  }
  return arr;
};
