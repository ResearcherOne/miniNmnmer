const dotenv = require('dotenv');

const result = dotenv.config();
if (result.error) {
    throw result.error
}

const HOST = process.env.HOST;
const PORT = parseInt(process.env.PORT);
const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;

const RECEIVE_EVENTS_TOPIC = process.env.RECEIVE_EVENTS_TOPIC;
const SEND_COMMANDS_TOPIC = process.env.SEND_COMMANDS_TOPIC;
const CONTROLLER_EVENTS_TOPIC = process.env.CONTROLLER_EVENTS_TOPIC;

module.exports = {
    HOST: HOST,
    PORT: PORT,
    USERNAME: USERNAME,
    PASSWORD: PASSWORD,

    RECEIVE_EVENTS_TOPIC: RECEIVE_EVENTS_TOPIC,
    SEND_COMMANDS_TOPIC: SEND_COMMANDS_TOPIC,
    CONTROLLER_EVENTS_TOPIC: CONTROLLER_EVENTS_TOPIC
}