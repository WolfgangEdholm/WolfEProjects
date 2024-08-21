/*global describe: false, it: false, expect: false*/
/*jslint browser: true*/
describe("A Basic Calculator Test Site. ", function() {
  it("Buttons should have their onclick property binded to change calc.output.value or to run calc.reset()", function() {
    var inputs = document.getElementsByTagName("input");
    for (var i = 0; i < inputs.length; i++) {
      if (inputs[i].type === "button") {
        expect(inputs[i].onclick).toBeDefined();
        var onclickFunctionString = inputs[i].onclick.toString();
        if (onclickFunctionString.indexOf("calc.reset()") !== -1) {
          // onclick event binded to calc.reset()
          expect(true);
        } else {
          expect(onclickFunctionString.indexOf("calc.output.value")).not.toBe(
            -1
          );
        }
      }
    }
  });
});
