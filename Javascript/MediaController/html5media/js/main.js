// The following comments are settings for various linters
// Not sure if a reported error matters? Look it up at http://linterrors.com/js
/*global console: false, window: false, document: false*/

/*jslint es5: true */
/*jslint node: false*/
/*jslint browser: true*/
/*jslint devel: true*/
/*jslint plusplus: true */

/*jshint es5: true */
/*jshint globalstrict: true*/
/*jshint jquery: false*/
/*jshint node: false*/
/*jshint browser: true*/
/*jshint devel: true*/

/*eslint-env jquery: false*/
/*eslint-env browser*/
/*eslint no-console: 0*/

/*
 * TODO: Make sure you read this entire file and
 * these Web pages BEFORE you start working!:
 * https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Using_HTML5_audio_and_video
 * The "HTML Audio/Video Events" section at:
 * http://www.w3schools.com/tags/ref_av_dom.asp
 * https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement
 * Then start below with the "TODO: DO THIS FIRST" section.
 *
 * Complete the code for this file, following the hints in the comments.
 * Start with the "TODO: DO THIS FIRST: section in the MIDDLE of this file!
 * Do complete the code marked by "TODO" comments,
 * but do NOT re-write function/method signatures
 * (a method's signature is its name, parameters,
 * and the order of the parameters).
 */
window.onload = function() {
  "use strict";
  // Getting the media elements
  var mediaElement1 = document.getElementById("mediaElement1");
  var mediaElement2 = document.getElementById("mediaElement2");
  var mediaElement3 = document.getElementById("mediaElement3");
  var mediaElement4 = document.getElementById("mediaElement4");
  // Getting the buttons
  var playOrPauseButton1 = document.getElementById("playOrPauseButton1");
  var playOrPauseButton2 = document.getElementById("playOrPauseButton2");
  var playOrPauseButton3 = document.getElementById("playOrPauseButton3");
  var playOrPauseButton4 = document.getElementById("playOrPauseButton4");
  var stopButton1 = document.getElementById("stopButton1");
  var stopButton2 = document.getElementById("stopButton2");
  var stopButton3 = document.getElementById("stopButton3");
  var stopButton4 = document.getElementById("stopButton4");
  var increaseVolumeButton1 = document.getElementById("increaseVolumeButton1");
  var increaseVolumeButton2 = document.getElementById("increaseVolumeButton2");
  var increaseVolumeButton3 = document.getElementById("increaseVolumeButton3");
  var increaseVolumeButton4 = document.getElementById("increaseVolumeButton4");
  var decreaseVolumeButton1 = document.getElementById("decreaseVolumeButton1");
  var decreaseVolumeButton2 = document.getElementById("decreaseVolumeButton2");
  var decreaseVolumeButton3 = document.getElementById("decreaseVolumeButton3");
  var decreaseVolumeButton4 = document.getElementById("decreaseVolumeButton4");

  var playOrPauseButtonEventHandler = function(event) {
    console.log("play or pause button"); // log for debugging
    var playOrPauseButton = event.target;
    var mediaElement;

    // Use the playOrPauseButton.id to find its matching media element
    // and set the mediaElement variable to that element.
    if (playOrPauseButton.id === "playOrPauseButton1") {
      mediaElement = mediaElement1;
    } else if (playOrPauseButton.id === "playOrPauseButton2") {
      mediaElement = mediaElement2;
    } else if (playOrPauseButton.id === "playOrPauseButton3") {
      mediaElement = mediaElement3;
    } else if (playOrPauseButton.id === "playOrPauseButton4") {
      mediaElement = mediaElement4;
    } else {
      console.log("Not a play or pause button!"); // log for debugging
    }

    // Play or pause the mediaElement
    if (mediaElement.paused) {
      mediaElement.play();
    } else {
      mediaElement.pause();
    }
  };

  // Bind all play or pause buttons to call playOrPauseButtonEvenHandler(event) when clicked
  playOrPauseButton1.addEventListener(
    "click",
    playOrPauseButtonEventHandler,
    false
  );
  playOrPauseButton2.addEventListener(
    "click",
    playOrPauseButtonEventHandler,
    false
  );
  playOrPauseButton3.addEventListener(
    "click",
    playOrPauseButtonEventHandler,
    false
  );
  playOrPauseButton4.addEventListener(
    "click",
    playOrPauseButtonEventHandler,
    false
  );

  var stopButtonEventHandler = function(event) {
    var stopButton = event.target;
    var mediaElement;

    // Use the stopButton.id to find its matching media element
    // Set the mediaElement variable to that element.
    if (stopButton.id === "stopButton1") {
      mediaElement = mediaElement1;
    } else if (stopButton.id === "stopButton2") {
      mediaElement = mediaElement2;
    } else if (stopButton.id === "stopButton3") {
      mediaElement = mediaElement3;
    } else if (stopButton.id === "stopButton4") {
      mediaElement = mediaElement4;
    } else {
      console.log("Not a stop button!"); // log for debugging
    }

    // Stop the mediaElement
    mediaElement.pause();
    mediaElement.currentTime = 0;
  };

  // Bind all of the stop buttons to call our stopButtonEventHandler(event) function when clicked
  stopButton1.addEventListener("click", stopButtonEventHandler, false);
  stopButton2.addEventListener("click", stopButtonEventHandler, false);
  stopButton3.addEventListener("click", stopButtonEventHandler, false);
  stopButton4.addEventListener("click", stopButtonEventHandler, false);

  var mediaEventHandler = function(event) {
    var mediaElement = this;
    var button;

    // log for debugging
    console.log("mediaEventHandler called with event:", event);
    console.log("mediaEventHandler called with event.target:", event.target);
    console.log(
      "mediaEventHandler called with event.currentTarget:",
      event.currentTarget
    );
    console.log("mediaEventHandler called with this:", this);

    // Use the mediaElement.id to find its matching play or pause button element
    if (mediaElement.id === "mediaElement1") {
      button = playOrPauseButton1;
    } else if (mediaElement.id === "mediaElement2") {
      button = playOrPauseButton2;
    } else if (mediaElement.id === "mediaElement3") {
      button = playOrPauseButton3;
    } else if (mediaElement.id === "mediaElement4") {
      button = playOrPauseButton4;
    } else {
      console.log("Not a media element!"); // log for debugging
    }

    // Set the button's innerHTML to 'Pause' or 'Play' depending on if the media element is paused or not
    if (mediaElement.paused) {
      button.innerHTML = "Play";
    } else {
      button.innerHTML = "Pause";
    }

    // If the media element just ended, mark it as watched.
    // If the media element has been watched, add a check mark to the beginning of the button's display.
    if (event.type === "ended") {
      mediaElement.watched = true;
    }
    if (mediaElement.watched) {
      button.innerHTML = "✅" + button.innerHTML;
    }
  };

  // bind all of the video and audio media elements to call mediaEventHandler(event)
  // function in reaction to 'playing', 'pause', and 'ended' events.
  mediaElement1.addEventListener("playing", mediaEventHandler, false);
  mediaElement2.addEventListener("playing", mediaEventHandler, false);
  mediaElement3.addEventListener("playing", mediaEventHandler, false);
  mediaElement4.addEventListener("playing", mediaEventHandler, false);
  mediaElement1.addEventListener("pause", mediaEventHandler, false);
  mediaElement2.addEventListener("pause", mediaEventHandler, false);
  mediaElement3.addEventListener("pause", mediaEventHandler, false);
  mediaElement4.addEventListener("pause", mediaEventHandler, false);
  mediaElement1.addEventListener("ended", mediaEventHandler, false);
  mediaElement2.addEventListener("ended", mediaEventHandler, false);
  mediaElement3.addEventListener("ended", mediaEventHandler, false);
  mediaElement4.addEventListener("ended", mediaEventHandler, false);

  var increaseVolume = function(mediaElement) {
    // Increase the volume property of the media element by 0.1 if it is under 1.0
    // a volume above 0.9 is automatically made 1.0
    var volume = mediaElement.volume;
    console.log(volume);
    if (volume <= 0.9) {
      mediaElement.volume += 0.1;
    } else {
      mediaElement.volume = 1.0;
    }
  };

  // call increaseVolume(mediaElement) when an increase volume button is clicked
  increaseVolumeButton1.onclick = function(event) {
    increaseVolume(mediaElement1);
  };
  increaseVolumeButton2.onclick = function(event) {
    increaseVolume(mediaElement2);
  };
  increaseVolumeButton3.onclick = function(event) {
    increaseVolume(mediaElement3);
  };
  increaseVolumeButton4.onclick = function(event) {
    increaseVolume(mediaElement4);
  };

  var decreaseVolume = function(mediaElement) {
    // Decrease the volume property of the media element by 0.1 if it is above 0.0
    // a volume of below 0.1 is automatically set to 0.0
    var volume = mediaElement.volume;
    console.log(volume);
    if (volume >= 0.1) {
      mediaElement.volume -= 0.1;
    } else {
      mediaElement.volume = 0.0;
    }
  };

  // call decreaseVolume(mediaElement) when a decrease volume button is clicked
  decreaseVolumeButton1.onclick = function(event) {
    decreaseVolume(mediaElement1);
  };
  decreaseVolumeButton2.onclick = function(event) {
    decreaseVolume(mediaElement2);
  };
  decreaseVolumeButton3.onclick = function(event) {
    decreaseVolume(mediaElement3);
  };
  decreaseVolumeButton4.onclick = function(event) {
    decreaseVolume(mediaElement4);
  };
};
