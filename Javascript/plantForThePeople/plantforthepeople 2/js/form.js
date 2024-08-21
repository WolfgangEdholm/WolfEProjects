// The following comments are settings for various linters
// Not sure if a reported error matters? Look it up at http://linterrors.com/js
/*global console: false, window: false, document: false, Modernizr:false, DEBUG:true, $:false */

/*jslint jquery: true*/
/*jslint node: false*/
/*jslint browser: true*/
/*jslint devel: true*/
/*jslint plusplus: true */

/*jshint globalstrict: true*/
/*jshint jquery: true*/
/*jshint node: false*/
/*jshint browser: true*/
/*jshint devel: true*/
/*exported processFormData */
/*exported form */

/*eslint-env es5*/
/*eslint-env jquery: true*/
/*eslint-env browser*/
/*eslint no-console: 0*/

"use strict";
//This 'flag' variable controls if we output debugging info to the console or not
var DEBUG = true;

// Setup variables for using the intlTelInput plugin:
// Since version 14, intlTelInput removed the jQuery dependency, so select the
// HTML Element with the id of "phone" withOUT using jQuery
var telInput = document.querySelector("#phone");
// jQuery WILL be used to hide and show the error message and valid message HTML
// Elements, so select them both using jQuery
var errorMsg = $("#error-msg");
var validMsg = $("#valid-msg");
// The following errorMap array maps to the error code returned from
// getValidationError - see the intlTelInput plugin readme
var errorMap = [
  "Invalid number",
  "Invalid country code",
  "Too short",
  "Too long",
  "Invalid number"
];

// Initialize intlTelInput to use the utilsScript to load Google's libphonenumber utility
var iti = window.intlTelInput(telInput, {
  utilsScript: "js/vendor/intl-tel-input-master/build/js/utils.js"
});

// Reset messages using jQuery's show and hide methods
var reset = function() {
  // TODO: Clear the message string in the errorMsg span
  errorMsg.text("");
  errorMsg.hide();
  validMsg.hide();
};

// Validates telInput on "blur" event
telInput.addEventListener(
  "blur",
  function() {
    if (iti.isValidNumber()) {
      // show validMsg if telInput is valid
      console.log("valid phone number!"); // log for debugging
      validMsg.show();
    } else {
      // show errorMsg if telInput is invalid
      // TODO: use the errorMap to show specialized error messages for the telInput field
      var errorCode = iti.getValidationError();
      console.log("error code: " + errorCode);
      errorMsg.text(errorMap[errorCode]);
      errorMsg.show();
      console.log(errorMsg.text());
      //console.log("invalid phone number!"); // log for debugging
    }
  },
  false
);

// Use addEventListener to bind telInput's keyup and change events to call reset
/*
    TODO: Your team left out making the 3rd argument to be false to indicate you all don't want the event capture phase to be used.
    That way the code is more compatible across browsers. See:
    https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture
    and the useCapture section at:
    https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Other_notes
    */
telInput.addEventListener("change", reset, false);
telInput.addEventListener("keyup", reset, false);

// The purpose of processFormData is to do final validation checks,
// and to stop the form from submitting,
// but you can also use it to help with debugging
var processFormData = function(event) {
  // prevent the default behavior of the form submit event
  event.preventDefault();
  if (DEBUG) {
    console.log(event);
    console.log(this);
    var form = document.forms.post_plant;
    console.log(form);
  }

  var $form = $("#post_plant");
  /*jshint unused: vars */
  var submitOnlyIfValid = function(form) {
    var errmsg = "";
    // Check if the form is valid
    if ($form.valid()) {
      $("div.error").hide();
    } else {
      // not valid
      $("div.error").show("slow");
      errmsg = "form was considered NOT valid and form submission is cancelled";
      if (DEBUG) {
        console.log(errmsg);
      }
      alert(errmsg);
      return false;
    }
    // Also check with the non-jQuery intlTelInput validation
    if (telInput && iti) {
      // intlTelInput exists so see if it is valid
      if (telInput.value.trim()) {
        if (!iti.isValidNumber()) {
          // Don't submit the form since intlTelInput is
          // not valid
          $("div.error span").html("Phone number is not valid");
          $("div.error").show("slow");
          errmsg =
            "intlTelInput was considered NOT valid and form submission is cancelled";
          if (DEBUG) {
            console.log(errmsg);
          }
          alert(errmsg);
          return false;
        }
      }
    }
    if (DEBUG) {
      console.log(
        "Form was considered valid and normally would have been submitted"
      );
    }
    alert("Form was considered valid and normally would have been submitted.");
    return true;
  };

  // Validate the form
  $form.validate({
    rules: {
      // Makes the planting_date a required field for the user
      // and makes sure that it is written in dateISO format
      planting_date: {
        required: true,
        dateISO: true
      }
      // Checked in browser consoles that planting_date will always be in dateISO format
    },

    invalidHandler: function(event, validator) {
      console.log($("#planting_date").val());
      // Inside this function 'this' refers to the form
      var errors = validator.numberOfInvalids();
      if (errors) {
        var message =
          errors === 1
            ? "You missed 1 field. It has been highlighted"
            : "You missed " + errors + " fields. They have been highlighted";
        $("div.error span").html(message);
        $("div.error").show("slow");
      } else {
        $("div.error").hide();
      }
    },
    submitHandler: submitOnlyIfValid
  });

  // If the form is valid hide div.error
  if ($form.valid()) {
    $("div.error").hide();
  }

  // returning false also stops the form from submitting
  return submitOnlyIfValid($form);
};

// If the browser supports the date input type, don't do anything
// This code is cribbed from
// http://code.tutsplus.com/tutorials/quick-tip-cross-browser-datepickers-within-minutes--net-20236
var initDatePicker = function() {
  // Modernizr (https://modernizr.com/) gives you the ability to detect
  // whether the browser supports native datepickers.
  if (DEBUG) {
    console.log("Modernizr.inputtypes.date:", Modernizr.inputtypes.date);
  }
  if (!Modernizr.inputtypes.date) {
    // jQuery UI Date Picker
    $("#planting_date").datepicker({
      // format date picker with 'yy-mm-dd'
      dateFormat: "yy-mm-dd" // TODO: Use dateFormat, not format here
    });
  }
};
// Initialize the jQuery UI plugin's DatePicker plugin for the planting date
initDatePicker();
/*
// use jquery timepicker if browser does not support the time input type
var initTimePicker = function() {
  if (DEBUG) {
    console.log("Modernizr.inputtypes.time:", Modernizr.inputtypes.time);
  }

  if (!Modernizr.inputtypes.timepicker) {
    // jquery-timepicker
    $("#planting_time").timepicker({
      // format time picker
      showDuration: true,
      timeFormat: "h:i A"
    });
  }
};

// Initialize jquery-timepicker plugin for the planting time
initTimePicker();
*/
// TODO: The code above is not needed as the jQuery-timepicker is better than
// the default Firefox timepicker. This assignment also calls for the default
// behaviour of the jQuery-timepicker so a formatting configurtaion object
// it not wanted as a parameter when calling timepicker() on #planting_time.
var initTimePicker = function() {
  $("#planting_time").timepicker();
};

initTimePicker();
