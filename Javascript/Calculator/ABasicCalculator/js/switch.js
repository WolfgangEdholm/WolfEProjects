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

// CS22A: A Basic Calculator Part 2 - calcu() function with switch
//////////////////////////////////////////////////////////////////////////////////////////////
// The value from the HTML page is passed through calcu() as a parameter argument,
// e.g., calcu('1') which takes the place of 'calcValue' entering the function below
// which is then passed to the switch for comparison. If the value of calcValue equals
// '1' then the first case of the switch will be true and the value of the output text
// box will be a '1' with the += concatenating this value every time the button is pressed.
// The math.eval() function at the bottom turns all the concatenated string into an arithmetic
// equation that can be evaluated, thus allowing the calculator to produce a viable answer.
//////////////////////////////////////////////////////////////////////////////////////////////

/*
Defined calcu function using switch statement
Onclick method calls calcu(this.name) and this.name is assigned to calcValue in the function
All numbers and operations add corresponding value to the output value string
*/
var calcu = function(calcValue) {
  "use strict";
  switch (calcValue) {
    // Add missing code here
    case "one":
      calc.output.value += "1";
      break;
    case "two":
      calc.output.value += "2";
      break;
    case "three":
      calc.output.value += "3";
      break;
    case "four":
      calc.output.value += "4";
      break;
    case "five":
      calc.output.value += "5";
      break;
    case "six":
      calc.output.value += "6";
      break;
    case "seven":
      calc.output.value += "7";
      break;
    case "eight":
      calc.output.value += "8";
      break;
    case "nine":
      calc.output.value += "9";
      break;
    case "zero":
      calc.output.value += "0";
      break;
    case "add":
      calc.output.value += "+";
      break;
    case "subtract":
      calc.output.value += "-";
      break;
    case "multiply":
      calc.output.value += "*";
      break;
    case "divide":
      calc.output.value += "/";
      break;
    case "clear":
      // sets the output value to an empty string
      calc.output.value = "";
      break;

    case "equate":
      // use the math.eval() function from the Math.js math library to parse and evaluate the String with mathematics in it
      calc.output.value = math.eval(calc.output.value);
      break;
  }
};
