// Cribbed from https://www.wikitechy.com/tutorials/javascript/how-to-find-event-listeners-on-a-dom-node-when-debugging-or-from-the-javascript-code
function listenerInfoReporter(event) {
  "use strict";
  var listenerInfo = this.lastListenerInfo[this.lastListenerInfo.length - 1];
  console.log(listenerInfo);
}

HTMLInputElement.prototype.realAddEventListener =
  HTMLInputElement.prototype.addEventListener;

HTMLInputElement.prototype.addEventListener = function(
  eventType,
  listener,
  useCaptureOrOptions
) {
  "use strict";
  this.realAddEventListener(
    eventType,
    listenerInfoReporter,
    useCaptureOrOptions
  );
  this.realAddEventListener(eventType, listener, useCaptureOrOptions);
  if (!this.lastListenerInfo) {
    this.lastListenerInfo = new Array();
  }
  this.lastListenerInfo.push({
    eventType: eventType,
    listener: listener,
    useCaptureOrOptions: useCaptureOrOptions
  });
};
