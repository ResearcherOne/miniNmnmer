const config = require("./config.js")

var mqtt = require('mqtt')
var client  = mqtt.connect({host: config.HOST, port: config.PORT, username: config.USERNAME, password: config.PASSWORD})

var rpio = require('rpio');

var exec = require('child_process').exec;
 
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

const teleprecenseEvents = {
    STATUS: "status",
    MOVEMENT: "movement",
    POWER: "power"
}

function shutdown(callback){
    exec('shutdown now', function(error, stdout, stderr){ callback(stdout); });
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

        const message = createEventMessage(teleprecenseEvents.MOVEMENT, "forward");
        client.publish(TELEPRECENSE_PUBLISH_EVENTS_TOPIC, message);
    } else if(movementDescription == movementDescriptions.BACKWARD) {
        stop();
        rpio.write(motorControllerPins.LEFT_SIDE_B, rpio.HIGH);
        rpio.write(motorControllerPins.RIGHT_SIDE_B, rpio.HIGH);

        const message = createEventMessage(teleprecenseEvents.MOVEMENT, "backward");
        client.publish(TELEPRECENSE_PUBLISH_EVENTS_TOPIC, message);
    } else if(movementDescription == movementDescriptions.RIGHT) {
        stop();
        rpio.write(motorControllerPins.LEFT_SIDE_A, rpio.HIGH);
        rpio.write(motorControllerPins.RIGHT_SIDE_B, rpio.HIGH);

        const message = createEventMessage(teleprecenseEvents.MOVEMENT, "right");
        client.publish(TELEPRECENSE_PUBLISH_EVENTS_TOPIC, message);
    } else if(movementDescription == movementDescriptions.LEFT) {
        stop();
        rpio.write(motorControllerPins.LEFT_SIDE_B, rpio.HIGH);
        rpio.write(motorControllerPins.RIGHT_SIDE_A, rpio.HIGH);

        const message = createEventMessage(teleprecenseEvents.MOVEMENT, "left");
        client.publish(TELEPRECENSE_PUBLISH_EVENTS_TOPIC, message);
    } else if(movementDescription == movementDescriptions.STOP) {
        stop();

        const message = createEventMessage(teleprecenseEvents.MOVEMENT, "stop");
        client.publish(TELEPRECENSE_PUBLISH_EVENTS_TOPIC, message);
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
        rpio.write(additionalPins.MQTT_CONNECTION_STATUS_PIN, rpio.HIGH);
        client.subscribe(TELEPRECENSE_RECEIVE_COMMANDS_TOPIC, function (err) {
            if (!err) {
                const message = createEventMessage(teleprecenseEvents.STATUS, "online");
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
                    const isValidMovement = isValidMovementDescription(data);
                    if(isValidMovement) {
                        console.log("UPDATE MOVEMENT: "+data);
                        updateMovement(data);
                    } else {
                        console.log("Unexpected move command received: "+data);
                    }
                } else if(receivedEvent.event == "power") {
                    const data = receivedEvent.data;
                    if(data == "shutdown") {
                        shutdown(function(stdout){
                            console.log("Shutting down the system: "+stdout);
                        })
                    } else {
                        console.log("Unexpected power command received: "+data);
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
        rpio.open(additionalPins.MQTT_CONNECTION_STATUS_PIN, rpio.OUTPUT, rpio.LOW);
        
    })

    client.on('offline', function(){
        console.log("OFFLINE")
        rpio.open(additionalPins.MQTT_CONNECTION_STATUS_PIN, rpio.OUTPUT, rpio.LOW);
    })
}

function exitHandler(options, exitCode) {
    rpio.open(additionalPins.MQTT_CONNECTION_STATUS_PIN, rpio.OUTPUT, rpio.LOW);

    if (options.cleanup) console.log('clean');
    if (exitCode || exitCode === 0) console.log(exitCode);
    if (options.exit) process.exit();
}

function registerGracefulShutdownEvents() {
    process.stdin.resume();//so the program will not close instantly
    //do something when app is closing
    process.on('exit', exitHandler.bind(null,{cleanup:true}));
    //catches ctrl+c event
    process.on('SIGINT', exitHandler.bind(null, {exit:true}));
    // catches "kill pid" (for example: nodemon restart)
    process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
    process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));
    //catches uncaught exceptions
    process.on('uncaughtException', exitHandler.bind(null, {exit:true}));
}

initialize();
registerGracefulShutdownEvents();