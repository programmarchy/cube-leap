if (process.argv.length < 3) {
  console.log('Usage: node leap.js PORT [ID1] [ID2]');
  return;
}

var device = process.argv[2];
var SerialPort = require('serialport').SerialPort;
var bluetoothCubelet = new SerialPort(device, { baudrate: 38400 });

var cubelets = require('cubelets');
var cubelet1ID = process.argv.length >= 4 ? process.argv[3] : 0;
var cubelet2ID = process.argv.length >= 5 ? process.argv[4] : 0;
var cubelet1Value = 0;
var cubelet2Value = 0;

var Leap = require('leapjs');
var controller = new Leap.Controller();
var interactionBox = null;

function mapToCubeletValue(t) {
  var p = interactionBox.normalizePoint(t);
  var x = p[0];
  var y = p[1];
  var z = p[2];
  return Math.round(255 * ((y * 0.5) + 1));
}

bluetoothCubelet.on('open', function() {
  console.log('Bluetooth Cubelet connected...');
  setInterval(function() {
    console.log(cubelet1Value, cubelet2Value);
    if (cubelet1ID) {
      bluetoothCubelet.write(new cubelets
        .SetBlockValueCommand(cubelet1ID, cubelet1Value)
          .encode());
    }
    if (cubelet2ID) {
      bluetoothCubelet.write(new cubelets
        .SetBlockValueCommand(cubelet2ID, cubelet2Value)
          .encode());
    }
  }, 200);
});

var firstFrame = null;
controller.on("frame", function(frame) {
  if (frame.valid) {
    if (!firstFrame) {
      firstFrame = frame;
    }
    if (!interactionBox) {
      interactionBox = new Leap.InteractionBox(frame.interactionBox);
    }
    if (frame.hands.length >= 1) {
      cubelet1Value = mapToCubeletValue(frame.hands[0].translation(firstFrame));
    }
    if (frame.hands.length >= 2) {
      cubelet2Value = mapToCubeletValue(frame.hands[1].translation(firstFrame));
    }
  }
});

controller.on('ready', function() {
  console.log("Ready...");
  controller.connection.send(JSON.stringify({"focused":true}));
});

controller.connect();
console.log("\nWaiting for device to connect...");
