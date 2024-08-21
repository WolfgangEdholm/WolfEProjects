/*global describe: false, it: false, expect: false, calcu: false*/
/*jslint browser: true*/
describe("A Basic Calculator Test Site", function() {
  "use strict";
  var DEBUG = false;
  it("calcu should exist", function() {
    expect(calcu).toBeDefined();
  });

  it("buttons should have their onclick event binded to calcu(this.id)", function() {
    var inputs = document.getElementsByTagName("input");
    for (var i = 0; i < inputs.length; i++) {
      if (inputs[i].type === "button") {
        expect(inputs[i].onclick).toBeDefined();
        if (inputs[i].onclick == null) {
          if (inputs[i].lastListenerInfo == null) {
            console.log("You didn't bind a click event for button:", inputs[i]);
            expect(inputs[i].lastListenerInfo).toBeDefined();
          } else {
            console.log("addEventListeners for button:", inputs[i]);
            var onclickFunctionString = "";
            inputs[i].lastListenerInfo.forEach((listenerInfo, i) => {
              if (DEBUG) {
                console.log(i, listenerInfo);
              }
              if (listenerInfo) {
                onclickFunctionString += listenerInfo.toString();
              }
            });
            expect(onclickFunctionString.indexOf("calcu")).not.toBe(-1);
            expect(onclickFunctionString.indexOf("this.id)")).not.toBe(-1);
          }
        } else {
          var onclickFunctionString = inputs[i].onclick.toString();
          expect(onclickFunctionString.indexOf("calcu")).not.toBe(-1);
          expect(onclickFunctionString.indexOf("this.id)")).not.toBe(-1);
        }
      }
    }
  });
});
