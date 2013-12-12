if (process.argv.length < 3) {
  console.log('Usage: node leap.js PORT [ID1] [ID2]');
  return;
}

var device = process.argv[2];
var SerialPort = require('serialport').SerialPort;
var mossBrain = new SerialPort(device, { baudrate: 115200 });
var mossBrainFace1Index = process.argv.length >= 4 ? parseInt(process.argv[3]) : -1;
var mossBrainFace2Index = process.argv.length >= 5 ? parseInt(process.argv[4]) : -1;
var mossBrainFace1Value = 0;
var mossBrainFace2Value = 0;

var Leap = require('leapjs');
var controller = new Leap.Controller();
var interactionBox = null;

function mapToMossBrainFaceValue(t) {
  var p = interactionBox.normalizePoint(t);
  var x = p[0];
  var y = p[1];
  var z = p[2];
  return Math.max(0, Math.min(Math.round(255 * y), 255));
}

mossBrain.on('open', function() {
  console.log('Moss Brain connected...');
  mossBrain.write(new Buffer([
    '<'.charCodeAt(0),
    'c'.charCodeAt(0), 0, 8,
    '>'.charCodeAt(0), 0, 0, 0, 0, 0, 0, 0, 0
  ]));
  setInterval(function() {
    console.log(mossBrainFace1Value, mossBrainFace2Value);
    if (mossBrainFace1Index >= 0) {
      mossBrain.write(new Buffer([
        '<'.charCodeAt(0),
        'v'.charCodeAt(0), 0, 2,
        '>'.charCodeAt(0), mossBrainFace1Index, mossBrainFace1Value
      ]));
    }
    if (mossBrainFace2Index >= 0) {
      mossBrain.write(new Buffer([
        '<'.charCodeAt(0),
        'v'.charCodeAt(0), 0, 2,
        '>'.charCodeAt(0), mossBrainFace2Index, mossBrainFace2Value
      ]));
    }
  }, 50);
});

controller.on("frame", function(frame) {
  if (frame.valid) {
    if (!interactionBox) {
      interactionBox = new Leap.InteractionBox(frame.interactionBox);
    }
    if (frame.hands.length >= 1) {
      mossBrainFace1Value = mapToMossBrainFaceValue(frame.hands[0].palmPosition);
    }
    else {
      mossBrainFace1Value = 127;
    }
    if (frame.hands.length >= 2) {
      mossBrainFace2Value = mapToMossBrainFaceValue(frame.hands[1].palmPosition);
    }
    else {
      mossBrainFace2Value = 127;
    }
  }
});

controller.on('ready', function() {
  console.log("Ready...");
  controller.connection.send(JSON.stringify({"focused":true}));
});

controller.connect();
console.log("Waiting for device to connect...");
