// Wolfgang Edholm, Xinyu Guo

// The following comments are settings for various linters
// Not sure if a reported error matters? Look it up at http://linterrors.com/js
/*global math: false, calc: false, console: false, eval: false */

/*jslint es5: true */
/*jslint node: false*/
/*jslint browser: true*/
/*jslint devel: true*/
/*jslint plusplus: true */
/*jslint evil: true */

/*jshint es5: true */
/*jshint globalstrict: true*/
/*jshint jquery: false*/
/*jshint node: false*/
/*jshint browser: true*/
/*jshint devel: true*/

/*eslint-env jquery: false*/
/*eslint-env browser*/
/*eslint no-console: 0*/

// CS22A: A Basic Calculator Part 3 - calcu() function with if-else

/* Uses ifelse statement to add the corresponding values of numbers
   and operators into the output string*/
var calcu = function(calcValue) {
  "use strict";
  if (calcValue) {
    // calcValue wasn't null or undefined'
    console.log("calcValue:", calcValue);
    if (calcValue === "1") {
      calc.output.value += calcValue;
    } else if (calcValue === "2") {
      calc.output.value += calcValue;
    } else if (calcValue === "3") {
      calc.output.value += calcValue;
    } else if (calcValue === "4") {
      calc.output.value += calcValue;
    } else if (calcValue === "5") {
      calc.output.value += calcValue;
    } else if (calcValue === "6") {
      calc.output.value += calcValue;
    } else if (calcValue === "7") {
      calc.output.value += calcValue;
    } else if (calcValue === "8") {
      calc.output.value += calcValue;
    } else if (calcValue === "9") {
      calc.output.value += calcValue;
    } else if (calcValue === "0") {
      calc.output.value += calcValue;
    } else if (calcValue === "+") {
      calc.output.value += calcValue;
    } else if (calcValue === "-") {
      calc.output.value += calcValue;
    } else if (calcValue === "*") {
      calc.output.value += calcValue;
    } else if (calcValue === "/") {
      calc.output.value += calcValue;
    } else if (calcValue === "c") {
      calc.output.value = "";
    } else if (calcValue === "equate") {
      calc.output.value = math.eval(calc.output.value);
    } else {
      // not a valid value
      console.log("Invalid!");
    }
  }
};

// Don't use window.onload!
// Usually using window.onload is a good idea,
// but that prevents the Jasmine test suite from loading and since the
// script tag for ifelse.js must be deferred and there are no big images to
// slow the loading of the HTML elements down it will all work OK without that.

//
var clickEventHandler = function(event) {
  "use strict";

  // call calcu()
  calcu(this.id);
};

// Assign all input elements to "inputs" variable
var inputs = document.getElementsByTagName("input");

// iterates through "inputs" array to separate inputs that are not defined with the "button" type
for (var i = 0; i < inputs.length; i++) {
  if (inputs[i].type === "button") {
    // set onclick handler to clickEventHandler()
    inputs[i].onclick = clickEventHandler;
  }
}
