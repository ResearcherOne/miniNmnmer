const config = require("./config.js")

var mqtt = require('mqtt')
var client  = mqtt.connect({host: config.HOST, port: config.PORT, username: config.USERNAME, password: config.PASSWORD})
 
const TELEPRECENSE_RECEIVE_COMMANDS_TOPIC = config.TELEPRECENSE_RECEIVE_COMMANDS_TOPIC;
const TELEPRECENSE_PUBLISH_EVENTS_TOPIC = config.TELEPRECENSE_PUBLISH_EVENTS_TOPIC;

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
    return {
        "event": "asd",
        "data": "asd"
    }
}

function updateMovement(movementDescription) {
    
}

client.on('connect', function () {
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
                if(data == "forward") {
                    updateMovement("forward");
                } else if(data == "backward") {
                    updateMovement("backward");
                } else if(data == "right") {
                    updateMovement("right");
                } else if(data == "left") {
                    updateMovement("left");
                } else if(data == "stop") {
                    updateMovement("stop");
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
