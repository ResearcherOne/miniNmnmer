const config = require("./config.js")

var mqtt = require('mqtt')
var client  = mqtt.connect({host: config.HOST, port: config.PORT, username: config.USERNAME, password: config.PASSWORD})

var rpio = require('rpio');
 
const TELEPRECENSE_RECEIVE_COMMANDS_TOPIC = config.TELEPRECENSE_RECEIVE_COMMANDS_TOPIC;
const TELEPRECENSE_PUBLISH_EVENTS_TOPIC = config.TELEPRECENSE_PUBLISH_EVENTS_TOPIC;

const movementDescriptions = {
    FORWARD: "forward",
    BACKWARD: "backward",
    RIGHT: "right",
    LEFT: "left",
    STOP: "stop"
}

const motorControllerPins = {
    RIGHT_SIDE_A: 16,
    RIGHT_SIDE_B: 18,
    LEFT_SIDE_A: 13,
    LEFT_SIDE_B: 15
};

const additionalPins = {
    MQTT_CONNECTION_STATUS_PIN: 12
};

function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
function createEventMessage(eventName, eventData) {
    const json = {
        "event": eventName,
        "data": eventData
    }
    return JSON.stringify(json);
}
function parseEventMessage(str) {
    const parsedObj = JSON.parse(str);
    return {
        "event": parsedObj.event,
        "data": parsedObj.data
    }
}

function stop() {
    rpio.write(motorControllerPins.LEFT_SIDE_A, rpio.LOW);
    rpio.write(motorControllerPins.LEFT_SIDE_B, rpio.LOW);
    rpio.write(motorControllerPins.RIGHT_SIDE_A, rpio.LOW);
    rpio.write(motorControllerPins.RIGHT_SIDE_B, rpio.LOW);
}

function updateMovement(movementDescription) {
    if(movementDescription == movementDescriptions.FORWARD) {
        stop();
        rpio.write(motorControllerPins.LEFT_SIDE_A, rpio.HIGH);
        rpio.write(motorControllerPins.RIGHT_SIDE_A, rpio.HIGH);
    } else if(movementDescription == movementDescriptions.BACKWARD) {
        stop();
        rpio.write(motorControllerPins.LEFT_SIDE_B, rpio.HIGH);
        rpio.write(motorControllerPins.RIGHT_SIDE_B, rpio.HIGH);
    } else if(movementDescription == movementDescriptions.RIGHT) {
        stop();
        rpio.write(motorControllerPins.LEFT_SIDE_A, rpio.HIGH);
        rpio.write(motorControllerPins.RIGHT_SIDE_B, rpio.HIGH);
    } else if(movementDescription == movementDescriptions.LEFT) {
        stop();
        rpio.write(motorControllerPins.LEFT_SIDE_B, rpio.HIGH);
        rpio.write(motorControllerPins.RIGHT_SIDE_A, rpio.HIGH);
    } else if(movementDescription == movementDescriptions.STOP) {
        stop();
    } else {
        console.log("Unexpected movement description: "+movementDescription);
    }
}

function isValidMovementDescription(movementDescription) {
    if(movementDescription == movementDescriptions.FORWARD) {
        return true;
    } else if(movementDescription == movementDescriptions.BACKWARD) {
        return true;
    } else if(movementDescription == movementDescriptions.RIGHT) {
        return true;
    } else if(movementDescription == movementDescriptions.LEFT) {
        return true;
    } else if(movementDescription == movementDescriptions.STOP) {
        return true;
    } else {
        return false;
    }
}

function initialize() {
    // GPIO Init
    rpio.open(motorControllerPins.RIGHT_SIDE_A, rpio.OUTPUT, rpio.LOW);
    rpio.open(motorControllerPins.RIGHT_SIDE_B, rpio.OUTPUT, rpio.LOW);
    rpio.open(motorControllerPins.LEFT_SIDE_A, rpio.OUTPUT, rpio.LOW);
    rpio.open(motorControllerPins.LEFT_SIDE_B, rpio.OUTPUT, rpio.LOW);
    rpio.open(additionalPins.MQTT_CONNECTION_STATUS_PIN, rpio.OUTPUT, rpio.LOW);

    // MQTT Init
    client.on('connect', function () {
        console.log("CONNECT")
        client.subscribe(TELEPRECENSE_RECEIVE_COMMANDS_TOPIC, function (err) {
            if (!err) {
                const message = createEventMessage("status", "online");
                client.publish(TELEPRECENSE_PUBLISH_EVENTS_TOPIC, message);
            }
        })
    })
     
    client.on('message', function (topic, message) {
        const receivedMessage = message.toString();
        const isJsonMessage = isJsonString(receivedMessage);
        if(isJsonMessage) {
            console.log("JSON message received!");
            console.log(receivedMessage);
    
            if(topic == TELEPRECENSE_RECEIVE_COMMANDS_TOPIC) {
                const receivedEvent = parseEventMessage(receivedMessage);
                if(receivedEvent.event == "move") {
                    const data = receivedEvent.data;
                    const isValidMovementDescription = isValidMovementDescription(data);
                    if(data == movementDescriptions.FORWARD) {
                        console.log("UPDATE MOVEMENT: "+data);
                        updateMovement(data);
                    } else {
                        console.log("Unexpected move command received: "+data);
                    }
                }
            }
        } else {
            console.log("Received message is not a json.");
            console.log(receivedMessage);
        }
    })

    client.on('reconnect', function(){
        console.log("RECONNECT")
    })

    client.on('offline', function(){
        console.log("OFFLINE")
    })
}

initialize();
