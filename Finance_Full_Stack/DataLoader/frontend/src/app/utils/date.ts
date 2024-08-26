
export const sysLocale = 'sv-SE';
export const sysTimeZone = 'UTC';
export const userLocale = 'en-US';
export const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;


// 45678911234567892123456789312345678941234567895123456789612345678971234567898

export const zeroTimeString =
  new Date(0).toJSON().slice(0, 19).replace('T', ' ');

//
export const uctToLocalDateString = (
  dateString: string,
  locale: string = userLocale,
  timeZone: string = userTimeZone,
): string => {
  const utcDateString = `${dateString} GMT`;
  const utcDate = new Date (utcDateString);
  return utcDate.toLocaleString('en-US', { timeZone: userTimeZone });
};

// console.log('Date0', locDate.toUTCString());

// const utcDateString = date.toISOString();
// const utcDateString = date.toLocaleString('sv-SE', { timeZone: 'UTC' });
// console.log('STR', utcDateString);
// const utcDate = new Date (utcDateString);

// console.log('Date1', utcDate);

// console.log('Date1a', date);
//   let options: Intl.DateTimeFormatOptions = {};
//   options.timeZone = 'UTC';
//   options.timeZoneName = 'short';
//   options.hour12 = false;
//   // options.timeStyle = 'full';

//   //const options = { timeZone: 'UTC', timeZoneName: 'short' };
//   //const options = { dateStyle: 'full', timeStyle: 'short' };
// console.log('Date2', date.toLocaleString('sv-SE', { timeZone: 'UTC' }));
// console.log('Date3', Intl.DateTimeFormat(sysLocale, options).format(date));

// d.toLocaleString('en-US', { timeZone: 'America/New_York' })

export const nowString = (): string =>
  new Date().toJSON().slice(0, 19).replace('T', ' ');

export const timeString = (time: Date): string =>
  time.toJSON().slice(0, 19).replace('T', ' ');

// Returns a pseudo fixed with string with hours, minutes and seconds.
// And milliseconds for small values.
// Max reasonable duration should be a few hours.
// The routine assumes a fixe with font is being used
export const durationString = (milliSeconds: number): string => {
  let outStr;

  let seconds = milliSeconds / 1000;
  if (seconds < 1) {
    //        20 hours 59 minutes 33.123 seconds
    outStr = `                   ${seconds.toFixed(3)} seconds`;
  } else if (seconds < 10) {
    //        20 hours 59 minutes 33.123 seconds
    outStr = `                     ${seconds.toFixed(2)} seconds`;
  } else if (seconds < 60) {
    outStr = `                    ${seconds.toFixed(0)} seconds`;
  } else {
    let minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;
    const hours = Math.floor(minutes / 60);
    minutes -= hours * 60;
    const minuteStr = `${minutes}`;
    minuteStr.padStart(2);
    const min = minutes === 1 ? 'minute ' : 'minutes';
    const secondStr = `${seconds.toFixed(0)}`;
    secondStr.padStart(2);
    const sec = seconds === 1 ? 'second ' : 'seconds';
    if (hours < 1) {
      //        20 hours 59 minutes 33.123 seconds
      outStr = `         ${minuteStr} ${min} ${secondStr}`;
    } else {
      const hourStr = `${hours}`;
      hourStr.padStart(2);
      const h = hours === 1 ? 'hour ' : 'hours';
      //        20 hours 59 minutes 33.123 seconds
      outStr = `${hourStr} ${h} ${minuteStr} ${min} ${secondStr} ${sec}`;
    }
  }
  return outStr;
};

// Returns a duration string with hours, minutes and seconds.
// And milliseconds for small values.
// Max reasonable duration should be a few hours.
// The routine assumes a fixe with font is being used
export const narrowDurationString = (milliSeconds: number): string => {
  let outStr;

  let seconds = milliSeconds / 1000;
  if (seconds < 1) {
    outStr = `${seconds.toFixed(3)} seconds`;
  } else if (seconds < 10) {
    outStr = `${seconds.toFixed(2)} seconds`;
  } else if (seconds < 60) {
    outStr = `${seconds.toFixed(0)} seconds`;
  } else {
    let minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;
    const hours = Math.floor(minutes / 60);
    minutes -= hours * 60;
    const minuteStr = `${minutes}`;
    const min = minutes === 1 ? 'minute' : 'minutes';
    const secondStr = `${seconds.toFixed(0)}`;
    const sec = seconds === 1 ? 'second ' : 'seconds';
    if (hours < 1) {
      outStr = `${minuteStr} ${min} ${secondStr}`;
    } else {
      const hourStr = `${hours}`;
      hourStr.padStart(2);
      const h = hours === 1 ? 'hour' : 'hours';
      outStr = `${hourStr} ${h} ${minuteStr} ${min} ${secondStr} ${sec}`;
    }
  }
  return outStr;
};

