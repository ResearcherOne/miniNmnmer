const config = require("./config.js")

var mqtt = require('mqtt')

var client  = mqtt.connect({host: config.MQTT_HOST, port: config.MQTT_PORT, username: config.MQTT_USERNAME, password: config.MQTT_PASSWORD})
const keyboardModule = require('./KeyboardModule.js')

const RECEIVE_EVENTS = config.RECEIVE_EVENTS_TOPIC;
const SEND_COMMANDS_TOPIC = config.SEND_COMMANDS_TOPIC;
const CONTROLLER_EVENTS_TOPIC = config.CONTROLLER_EVENTS_TOPIC;

const movementDescriptions = {
    FORWARD: "forward",
    BACKWARD: "backward",
    RIGHT: "right",
    LEFT: "left",
    STOP: "stop"
}

const controllerEvents = {
    MOVE: "move",
    STATUS: "status"
}

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

function initialize() {
    // MQTT Init
    client.on('connect', function () {
        console.log("CONNECT")
        client.subscribe(RECEIVE_EVENTS, function (err) {
            if (!err) {
                const message = createEventMessage(controllerEvents.STATUS, "online");
                client.publish(CONTROLLER_EVENTS_TOPIC, message);
            }
        })
    })
     
    client.on('message', function (topic, message) {
        const receivedMessage = message.toString();
        const isJsonMessage = isJsonString(receivedMessage);
        if(isJsonMessage) {
            console.log("JSON message received!");
            console.log(receivedMessage);
    
            if(topic == RECEIVE_EVENTS) {
                const receivedEvent = parseEventMessage(receivedMessage);
                console.log(receivedEvent);
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

    keyboardModule.setKeydownEventHandler(function(keyDescription){
        if(keyDescription == "UP") {
            const message = createEventMessage(controllerEvents.MOVE, movementDescriptions.FORWARD);
            client.publish(SEND_COMMANDS_TOPIC, message);
        } else if (keyDescription == "DOWN") {
            const message = createEventMessage(controllerEvents.MOVE, movementDescriptions.BACKWARD);
            client.publish(SEND_COMMANDS_TOPIC, message);
        } else if (keyDescription == "RIGHT") {
            const message = createEventMessage(controllerEvents.MOVE, movementDescriptions.RIGHT);
            client.publish(SEND_COMMANDS_TOPIC, message);
        } else if (keyDescription == "LEFT") {
            const message = createEventMessage(controllerEvents.MOVE, movementDescriptions.LEFT);
            client.publish(SEND_COMMANDS_TOPIC, message);
        } else if (keyDescription == "SPACE") {

        } else {
            console.log("Unknown key description: "+keyDescription);
        }
    });
    
    keyboardModule.setKeyupEventHandler(function(keyDescription){
        if(keyDescription == "UP") {
            const message = createEventMessage(controllerEvents.MOVE, movementDescriptions.STOP);
            client.publish(SEND_COMMANDS_TOPIC, message);
        } else if (keyDescription == "DOWN") {
            const message = createEventMessage(controllerEvents.MOVE, movementDescriptions.STOP);
            client.publish(SEND_COMMANDS_TOPIC, message);
        } else if (keyDescription == "RIGHT") {
            const message = createEventMessage(controllerEvents.MOVE, movementDescriptions.STOP);
            client.publish(SEND_COMMANDS_TOPIC, message);
        } else if (keyDescription == "LEFT") {
            const message = createEventMessage(controllerEvents.MOVE, movementDescriptions.STOP);
            client.publish(SEND_COMMANDS_TOPIC, message);
        } else if (keyDescription == "SPACE") {

        } else {
            console.log("Unknown key description: "+keyDescription);
        }
    });
}

initialize();
