'use strict';

const ioHook = require('iohook');

const keyCodes = {
  UP: 57416,
  DOWN: 57424,
  RIGHT: 57421,
  LEFT: 57419,

  SPACE: 57
}

var previousKeyStates = {};

var keydownEventHandler;
var keyupEventHandler;

function getKeyDescription(keyCode) {
    if(keyCode == keyCodes.UP) {
        return "UP";
    } else if(keyCode == keyCodes.DOWN) {
        return "DOWN";
    } else if(keyCode == keyCodes.RIGHT) {
        return "RIGHT";
    } else if(keyCode == keyCodes.LEFT) {
        return "LEFT";
    } else if(keyCode == keyCodes.SPACE) {
        return "SPACE";
    } else {
        return "UNKNOWN";
    }
}

function isRecognizedKeycode(keyCode) {
    if(keyCode == keyCodes.UP) {
        return true;
    } else if(keyCode == keyCodes.DOWN) {
        return true;
    } else if(keyCode == keyCodes.RIGHT) {
        return true;
    } else if(keyCode == keyCodes.LEFT) {
        return true;
    } else if(keyCode == keyCodes.SPACE) {
        return true;
    } else {
        return false;
    }
}

ioHook.on('keydown', event => {
    if(!keydownEventHandler) return;

    const eventKeycode = event.keycode;
    if(isRecognizedKeycode(eventKeycode)) {
        const previousKeyState = previousKeyStates[eventKeycode];
        if(previousKeyState == "keydown") {
            //pass
        } else if (previousKeyState == 'keyup') {
            previousKeyStates[eventKeycode] = "keydown";

            const keyDescription = getKeyDescription(eventKeycode);
            keydownEventHandler(keyDescription)
        } else {
            previousKeyStates[eventKeycode] = "keydown";

            const keyDescription = getKeyDescription(eventKeycode);
            keydownEventHandler(keyDescription)
        }
    }
});

ioHook.on('keyup', event => {
    if(!keyupEventHandler) return;

    const eventKeycode = event.keycode;
    if(isRecognizedKeycode(eventKeycode)) {
        const previousKeyState = previousKeyStates[eventKeycode];
        if(previousKeyState == "keyup") {
            //pass
        } else if (previousKeyState == 'keydown') {
            previousKeyStates[eventKeycode] = "keyup";

            const keyDescription = getKeyDescription(eventKeycode);
            keyupEventHandler(keyDescription)
        } else {
            previousKeyStates[eventKeycode] = "keyup";

            const keyDescription = getKeyDescription(eventKeycode);
            keyupEventHandler(keyDescription)
        }
    }
});

// Register and start hook
ioHook.start();

// Alternatively, pass true to start in DEBUG mode.
ioHook.start(true);

module.exports = {
    setKeydownEventHandler: function(callback) {
        keydownEventHandler = callback;
    },
    setKeyupEventHandler: function(callback) {
        keyupEventHandler = callback;
    }
}