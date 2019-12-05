'use strict';

const ioHook = require('iohook');


const keyCodes = {
    UP: "UP",
    DOWN: "DOWN",
    RIGHT: "RIGHT",
    LEFT: "LEFT",

    SPACE: "SPACE"
}

const linuxKeycodes = {
    UP: 57416,
    DOWN: 57424,
    RIGHT: 57421,
    LEFT: 57419,

    SPACE: 57
}

const windowsKeycodes = {
    UP: 61000,
    DOWN: 61008,
    RIGHT: 61005,
    LEFT: 61003,

    SPACE: 57
}

var previousKeyStates = {};

var keydownEventHandler;
var keyupEventHandler;

function isEqualKeycode(keyCode, keyCodeDescription) {
    if(keyCode == linuxKeycodes[keyCodeDescription]) {
        return true;
    } else if (keyCode == windowsKeycodes[keyCodeDescription]) {
        return true;
    } else {
        return false;
    }
}

function getKeyDescription(keyCode) {
    if(isEqualKeycode(keyCode, keyCodes.UP)) {
        return "UP";
    } else if(isEqualKeycode(keyCode, keyCodes.DOWN)) {
        return "DOWN";
    } else if(isEqualKeycode(keyCode, keyCodes.RIGHT)) {
        return "RIGHT";
    } else if(isEqualKeycode(keyCode, keyCodes.LEFT)) {
        return "LEFT";
    } else if(isEqualKeycode(keyCode, keyCodes.SPACE)) {
        return "SPACE";
    } else {
        return "UNKNOWN";
    }
}

function isRecognizedKeycode(keyCode) {
    if(isEqualKeycode(keyCode, keyCodes.UP)) {
        return true;
    } else if(isEqualKeycode(keyCode, keyCodes.DOWN)) {
        return true;
    } else if(isEqualKeycode(keyCode, keyCodes.RIGHT)) {
        return true;
    } else if(isEqualKeycode(keyCode, keyCodes.LEFT)) {
        return true;
    } else if(isEqualKeycode(keyCode, keyCodes.SPACE)) {
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