var Leap = require('leapjs');

var controller = new Leap.Controller();

var leftCubeletValue = 0;
var rightCubeletValue = 0;

function getCubeletValue(t) {
  t = Leap.normalizePosition(t);
  var x = t[0];
  var y = t[1];
  var z = t[2];
  console.log(x,y,z);
  return 255 * ((y * 0.5) + 1);
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
    if (frame.hands && frame.hands.length >= 2) {
      if (frame.hands[0] !== Leap.Hand.Invalid) {
        leftCubeletValue = getCubeletValue(frame.hands[0].translation(lastFrame));
      }
      if (frame.hands[1] !== Leap.Hand.Invalid) {
        rightCubeletValue = getCubeletValue(frame.hands[1].translation(lastFrame));
      }
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
