var Leap = require('leapjs');

var controller = new Leap.Controller();
var interactionBox = null;

var leftCubeletValue = 0;
var rightCubeletValue = 0;

function getCubeletValue(t) {
  var p = interactionBox.normalizePoint(t);
  var x = p[0];
  var y = p[1];
  var z = p[2];
  return Math.round(255 * ((y * 0.5) + 1));
}

setInterval(function() {
  console.log(leftCubeletValue, rightCubeletValue);
}, 200);

var lastFrame = null;
controller.on("frame", function(frame) {
  if (frame.valid) {
    if (!lastFrame) {
      lastFrame = frame;
    }
    if (!interactionBox) {
      interactionBox = new Leap.InteractionBox(frame.interactionBox);
    }
    if (frame.hands.length >= 1) {
      leftCubeletValue = getCubeletValue(frame.hands[0].translation(lastFrame));
    }
    if (frame.hands.length >= 2) {
      rightCubeletValue = getCubeletValue(frame.hands[1].translation(lastFrame));
    }
    lastFrame = frame;
  }
});

controller.on('ready', function() {
  console.log("Ready...");
  controller.connection.send(JSON.stringify({"focused":true}));
});

controller.connect();
console.log("\nWaiting for device to connect...");
