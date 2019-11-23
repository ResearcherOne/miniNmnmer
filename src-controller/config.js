const dotenv = require('dotenv');

const result = dotenv.config();
if (result.error) {
    throw result.error
}

const MQTT_HOST = process.env.MQTT_HOST;
const MQTT_PORT = parseInt(process.env.MQTT_PORT);
const MQTT_USERNAME = process.env.MQTT_USERNAME;
const MQTT_PASSWORD = process.env.MQTT_PASSWORD;

const RECEIVE_EVENTS_TOPIC = process.env.RECEIVE_EVENTS_TOPIC;
const SEND_COMMANDS_TOPIC = process.env.SEND_COMMANDS_TOPIC;
const CONTROLLER_EVENTS_TOPIC = process.env.CONTROLLER_EVENTS_TOPIC;

module.exports = {
    MQTT_HOST: MQTT_HOST,
    MQTT_PORT: MQTT_PORT,
    MQTT_USERNAME: MQTT_USERNAME,
    MQTT_PASSWORD: MQTT_PASSWORD,

    RECEIVE_EVENTS_TOPIC: RECEIVE_EVENTS_TOPIC,
    SEND_COMMANDS_TOPIC: SEND_COMMANDS_TOPIC,
    CONTROLLER_EVENTS_TOPIC: CONTROLLER_EVENTS_TOPIC
}