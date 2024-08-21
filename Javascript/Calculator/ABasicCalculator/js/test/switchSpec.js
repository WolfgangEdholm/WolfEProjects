/*global describe: false, it: false, expect: false, calcu: false*/
/*jslint browser: true*/
describe("A Basic Calculator Test Site. ", function() {
  it("calcu should exist", function() {
    expect(calcu).toBeDefined();
  });

  it("Buttons should have their onclick event binded to calcu", function() {
    var inputs = document.getElementsByTagName("input");
    for (var i = 0; i < inputs.length; i++) {
      if (inputs[i].type === "button") {
        expect(inputs[i].onclick).toBeDefined();
        var onclickFunctionString = inputs[i].onclick.toString();
        expect(onclickFunctionString.indexOf("calcu")).not.toBe(-1);
        //expect(onclickFunctionString.indexOf("this.id)")).not.toBe(-1);
      }
    }
  });
});
